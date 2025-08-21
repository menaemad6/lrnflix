
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { QuestionsLayout } from '@/components/layout/QuestionsLayout';
import { QuestionsLeftSidebar } from '@/components/questions/QuestionsLeftSidebar';
import { QuestionsRightSidebar } from '@/components/questions/QuestionsRightSidebar';
import { QuestionsList } from '@/components/questions/QuestionsList';
import { CreateQuestionModal } from '@/components/questions/CreateQuestionModal';
import { QuestionDetailModal } from '@/components/questions/QuestionDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Filter, TrendingUp, MessageSquare, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RootState } from '@/store/store';
import { formatDistanceToNow } from 'date-fns';

interface Question {
  id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  allow_student_answers: boolean;
  created_at: string;
  updated_at: string;
  status: string;
  student_id: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  } | null;
  answer_count?: number;
}

interface TopQuestion {
  id: string;
  title: string;
  answer_count: number;
}

interface TopUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  question_count: number;
}

export const QuestionsPage = () => {
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation('other');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [topQuestions, setTopQuestions] = useState<TopQuestion[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<Array<{
    action: string;
    time: string;
    user: string;
    type?: string;
    id?: string;
    actualTime?: string;
  }>>([]);

  const statusOptions = [
    { value: 'all', label: t('questionsPage.allQuestions'), icon: MessageSquare },
    { value: 'open', label: t('questionsPage.open'), icon: TrendingUp },
    { value: 'resolved', label: t('questionsPage.resolved'), icon: Users },
  ];

  useEffect(() => {
    fetchQuestions();
    fetchRecentActivity();
    setupRealtimeSubscription();
  }, []);

  // Refetch questions when status filter changes
  useEffect(() => {
    fetchQuestions();
  }, [statusFilter]);

  // Calculate sidebar data from questions data
  useEffect(() => {
    if (questions.length > 0) {
      calculateSidebarData();
    }
  }, [questions]);

  // Detect URL hash changes to show question modal
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#question-')) {
        const questionId = hash.substring(10); // Remove '#question-' prefix
        if (questionId) {
          setSelectedQuestionId(questionId);
          // Ensure questions are loaded if they aren't already
          if (questions.length === 0) {
            fetchQuestions();
          }
        }
      } else {
        setSelectedQuestionId(null);
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Also listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, [questions.length]);

  // Also listen for direct hash changes (when navigating programmatically)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#question-')) {
      const questionId = hash.substring(10); // Remove '#question-' prefix
      if (questionId && questionId !== selectedQuestionId) {
        setSelectedQuestionId(questionId);
      }
    }
  }, [selectedQuestionId]);

  // Force check hash when questions are loaded
  useEffect(() => {
    if (questions.length > 0 && window.location.hash) {
      const hash = window.location.hash;
      if (hash.startsWith('#question-')) {
        const questionId = hash.substring(10); // Remove '#question-' prefix
        if (questionId && questionId !== selectedQuestionId) {
          setSelectedQuestionId(questionId);
        }
      }
    }
  }, [questions, selectedQuestionId]);

  const setupRealtimeSubscription = () => {
    // Subscribe to questions changes
    const questionsChannel = supabase
      .channel('questions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions'
        },
        (payload) => {
          console.log('Questions change received:', payload);
                     if (payload.eventType === 'INSERT') {
             fetchQuestions();
             setRecentActivity(prev => {
              const newActivity = {
                action: t('questionsPage.newQuestionPosted'),
                time: t('questionsPage.justNow'),
                user: t('questionsPage.anonymous'),
                type: 'question',
                id: payload.new.id,
                actualTime: payload.new.created_at
              };
              const updatedActivities = [newActivity, ...prev.slice(0, 4)];
              return sortActivitiesByTime(updatedActivities);
            });
          } else if (payload.eventType === 'UPDATE') {
            setQuestions(prev => prev.map(q => 
              q.id === payload.new.id ? { ...q, ...payload.new } : q
            ));
          } else if (payload.eventType === 'DELETE') {
            setQuestions(prev => prev.filter(q => q.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to question_answers changes
    const answersChannel = supabase
      .channel('answers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'question_answers'
        },
                 (payload) => {
           console.log('Answers change received:', payload);
           fetchQuestions();
           if (payload.eventType === 'INSERT') {
            setRecentActivity(prev => {
              const newActivity = {
                action: t('questionsPage.newAnswerPosted'),
                time: t('questionsPage.justNow'),
                user: t('questionsPage.anonymous'),
                type: 'answer',
                id: payload.new.id,
                actualTime: payload.new.created_at
              };
              const updatedActivities = [newActivity, ...prev.slice(0, 4)];
              return sortActivitiesByTime(updatedActivities);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(questionsChannel);
      supabase.removeChannel(answersChannel);
    };
  };

  const fetchQuestions = async () => {
    try {
      let query = supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: questionsData, error } = await query;

      if (error) throw error;

      // Get profile data and answer counts for each question
      const questionsWithDetails = await Promise.all(
        (questionsData || []).map(async (question) => {
          // Get profile data - always fetch for teachers and admins, or for non-anonymous questions
          let profileData = null;
          const canSeeAnonymousNames = user && (user.role === 'teacher' || user.role === 'admin');
          
          if (!question.is_anonymous || canSeeAnonymousNames) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', question.student_id)
              .single();
            profileData = profile;
          }

          // Get answer count
          const { count } = await supabase
            .from('question_answers')
            .select('*', { count: 'exact', head: true })
            .eq('question_id', question.id);

          return {
            ...question,
            profiles: profileData,
            answer_count: count || 0,
          };
        })
      );

      setQuestions(questionsWithDetails);
    } catch (error: unknown) {
      console.error('Error fetching questions:', error);
      toast({
        title: 'Error',
        description: t('questionsPage.error.failedToLoad'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

    // Calculate sidebar data from existing questions data
  const calculateSidebarData = () => {
    // Calculate top questions by answer count
    const questionsWithCounts = questions.map(question => ({
      id: question.id,
      title: question.title,
      answer_count: question.answer_count || 0
    }));

    // Sort by answer count (most discussed first) and take top 5
    const sortedQuestions = questionsWithCounts
      .sort((a, b) => b.answer_count - a.answer_count)
      .slice(0, 5);

    setTopQuestions(sortedQuestions);

    // Calculate top users by question count
    const userQuestionCounts = new Map<string, { count: number; full_name: string; avatar_url?: string }>();
    
    questions.forEach(question => {
      const userId = question.student_id;
      const existing = userQuestionCounts.get(userId);
      
      if (existing) {
        existing.count += 1;
      } else {
        userQuestionCounts.set(userId, {
          count: 1,
          full_name: question.profiles?.full_name || t('questionsPage.anonymous'),
          avatar_url: question.profiles?.avatar_url
        });
      }
    });

    // Convert to array, sort by question count, and take top 5
    const sortedUsers = Array.from(userQuestionCounts.entries())
      .map(([id, data]) => ({
        id,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        question_count: data.count
      }))
      .sort((a, b) => b.question_count - a.question_count)
      .slice(0, 5);

    setTopUsers(sortedUsers);
  };



  const fetchRecentActivity = async () => {
    try {
      // Get recent questions
      const { data: recentQuestions, error: questionsError } = await supabase
        .from('questions')
        .select('id, title, created_at, student_id')
        .order('created_at', { ascending: false })
        .limit(3);

      if (questionsError) throw questionsError;

      // Get recent answers
      const { data: recentAnswers, error: answersError } = await supabase
        .from('question_answers')
        .select('id, content, created_at, user_id, question_id')
        .order('created_at', { ascending: false })
        .limit(3);

      if (answersError) throw answersError;

      // Get profile data for questions
      const questionUserIds = recentQuestions?.map(q => q.student_id) || [];
      const { data: questionProfiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', questionUserIds);

      // Get profile data for answers
      const answerUserIds = recentAnswers?.map(a => a.user_id) || [];
      const { data: answerProfiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', answerUserIds);

      // Combine and format activities
      const activities = [];
      
      // Add question activities
      if (recentQuestions) {
        recentQuestions.forEach(question => {
          const profile = questionProfiles?.find(p => p.id === question.student_id);
          activities.push({
            action: t('questionsPage.newQuestionPosted'),
            time: formatDistanceToNow(new Date(question.created_at), { addSuffix: true }),
            user: profile?.full_name || t('questionsPage.anonymous'),
            type: 'question',
            id: question.id
          });
        });
      }

      // Add answer activities
      if (recentAnswers) {
        recentAnswers.forEach(answer => {
          const profile = answerProfiles?.find(p => p.id === answer.user_id);
          activities.push({
            action: t('questionsPage.newAnswerPosted'),
            time: formatDistanceToNow(new Date(answer.created_at), { addSuffix: true }),
            user: profile?.full_name || t('questionsPage.anonymous'),
            type: 'answer',
            id: answer.id
          });
        });
      }

      // Sort by creation time (newest first) and take the most recent 5
      const sortedActivities = activities
        .sort((a, b) => {
          // Extract the actual creation time from the question/answer data
          if (a.type === 'question') {
            const question = recentQuestions?.find(q => q.id === a.id);
            if (question) {
              a.actualTime = question.created_at;
            }
          } else if (a.type === 'answer') {
            const answer = recentAnswers?.find(ans => ans.id === a.id);
            if (answer) {
              a.actualTime = answer.created_at;
            }
          }
          
          if (b.type === 'question') {
            const question = recentQuestions?.find(q => q.id === b.id);
            if (question) {
              b.actualTime = question.created_at;
            }
          } else if (b.type === 'answer') {
            const answer = recentAnswers?.find(ans => ans.id === b.id);
            if (answer) {
              b.actualTime = answer.created_at;
            }
          }
          
          // Sort by actual creation time, newest first
          return new Date(b.actualTime || b.time).getTime() - new Date(a.actualTime || a.time).getTime();
        })
        .slice(0, 5);

      setRecentActivity(sortedActivities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Fallback to default activity
      setRecentActivity([
        {
          action: t('questionsPage.newQuestionPosted'),
          time: t('questionsPage.justNow'),
          user: t('questionsPage.anonymous'),
          type: 'question',
          id: '1'
        }
      ]);
    }
  };

  const handleQuestionCreated = () => {
    fetchQuestions();
    fetchRecentActivity(); // Refresh recent activity
    setIsCreateModalOpen(false);
  };

  const handleCloseQuestionModal = () => {
    setSelectedQuestionId(null);
    // Remove the hash from URL
    window.history.pushState('', document.title, window.location.pathname);
  };

  // Function to sort activities by actual time (newest first)
  const sortActivitiesByTime = (activities: typeof recentActivity) => {
    return activities.sort((a, b) => {
      const timeA = a.actualTime ? new Date(a.actualTime).getTime() : new Date(a.time).getTime();
      const timeB = b.actualTime ? new Date(b.actualTime).getTime() : new Date(b.time).getTime();
      return timeB - timeA;
    });
  };

  // Apply both search and status filters
  const filteredQuestions = questions.filter((question) => {
    // First filter by status
    if (statusFilter !== 'all' && question.status !== statusFilter) {
      return false;
    }
    
    // Then filter by search term
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const stats = {
    total: questions.length,
    filtered: filteredQuestions.length,
    open: questions.filter(q => q.status === 'open').length,
    resolved: questions.filter(q => q.status === 'resolved').length,
  };

  return (
    <QuestionsLayout
      leftSidebar={
        <QuestionsLeftSidebar 
          stats={stats} 
          topQuestions={topQuestions}
          topUsers={topUsers}
          loading={false}
        />
      }
      rightSidebar={<QuestionsRightSidebar recentActivity={recentActivity} />}
    >
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            {t('questionsPage.questionsAnswers')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('questionsPage.askShareLearn')}
          </p>
        </div>

        {/* Action Bar */}
        <div className="glass-card p-6 bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm">
          <div className="space-y-4">
            {/* Search Input - Full Width */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('questionsPage.searchQuestions')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass bg-background/50 w-full"
              />
            </div>
            
            {/* Filter Buttons and Create Button Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Status Filter Buttons */}
              <div className="flex gap-2 flex-wrap items-center">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={statusFilter === option.value ? "default" : "outline"}
                      onClick={() => setStatusFilter(option.value)}
                      className={`transition-all duration-200 ${
                        statusFilter === option.value 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg' 
                          : 'bg-background/80 text-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {option.label}
                    </Button>
                  );
                })}
                
              </div>
              
              {/* Create Question Button */}
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('questionsPage.askQuestion')}
              </Button>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <QuestionsList 
          questions={filteredQuestions} 
          loading={loading}
          onQuestionUpdate={fetchQuestions}
          onQuestionClick={(questionId) => {
            setSelectedQuestionId(questionId);
            // Update URL hash
            window.location.hash = `question-${questionId}`;
          }}
        />
       </div>

       <CreateQuestionModal
         isOpen={isCreateModalOpen}
         onClose={() => setIsCreateModalOpen(false)}
         onQuestionCreated={handleQuestionCreated}
       />

       {/* Question Detail Modal */}
       {selectedQuestionId && (
         <QuestionDetailModal
           questionId={selectedQuestionId}
           questions={questions}
           onClose={handleCloseQuestionModal}
         />
       )}
     </QuestionsLayout>
   );
 };
