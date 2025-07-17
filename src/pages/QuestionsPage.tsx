
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { QuestionsLayout } from '@/components/layout/QuestionsLayout';
import { QuestionsLeftSidebar } from '@/components/questions/QuestionsLeftSidebar';
import { QuestionsRightSidebar } from '@/components/questions/QuestionsRightSidebar';
import { QuestionsList } from '@/components/questions/QuestionsList';
import { CreateQuestionModal } from '@/components/questions/CreateQuestionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Filter, TrendingUp, MessageSquare, Users } from 'lucide-react';
import type { RootState } from '@/store/store';

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [topQuestions, setTopQuestions] = useState<TopQuestion[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [recentActivity, setRecentActivity] = useState<Array<{
    action: string;
    time: string;
    user: string;
  }>>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Questions', icon: MessageSquare },
    { value: 'open', label: 'Open', icon: TrendingUp },
    { value: 'resolved', label: 'Resolved', icon: Users },
  ];

  useEffect(() => {
    fetchQuestions();
    fetchTopQuestions();
    fetchTopUsers();
    setupRealtimeSubscription();
  }, []);

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
            fetchTopQuestions();
            setRecentActivity(prev => [{
              action: 'New question posted',
              time: 'Just now',
              user: 'Anonymous'
            }, ...prev.slice(0, 4)]);
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
          fetchTopQuestions();
          if (payload.eventType === 'INSERT') {
            setRecentActivity(prev => [{
              action: 'New answer posted',
              time: 'Just now',
              user: 'Anonymous'
            }, ...prev.slice(0, 4)]);
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
        description: 'Failed to load questions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTopQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          id,
          title,
          question_answers(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate answer counts and sort
      const questionsWithCounts = data?.map(q => ({
        id: q.id,
        title: q.title,
        answer_count: q.question_answers?.length || 0
      })).sort((a, b) => b.answer_count - a.answer_count) || [];

      setTopQuestions(questionsWithCounts);
    } catch (error) {
      console.error('Error fetching top questions:', error);
    }
  };

  const fetchTopUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          questions:questions(count)
        `)
        .not('questions', 'is', null);

      if (error) throw error;

      // Calculate question counts and sort
      const usersWithCounts = data?.map(user => ({
        id: user.id,
        full_name: user.full_name || 'Anonymous',
        avatar_url: user.avatar_url,
        question_count: user.questions?.length || 0
      })).sort((a, b) => b.question_count - a.question_count) || [];

      setTopUsers(usersWithCounts);
    } catch (error) {
      console.error('Error fetching top users:', error);
    }
  };

  const handleQuestionCreated = () => {
    fetchQuestions();
    fetchTopQuestions();
    setIsCreateModalOpen(false);
  };

  const filteredQuestions = questions.filter((question) =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: questions.length,
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
            Questions & <span className="gradient-text">Answers</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ask questions, share knowledge, and learn together with our AI-powered community
          </p>
        </div>

        {/* Action Bar */}
        <div className="glass-card p-6 bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className={`flex flex-col md:flex-row gap-4 flex-1 transition-all duration-300 ${
              isSearchFocused ? 'w-full' : ''
            }`}>
              <div className={`relative transition-all duration-300 ${
                isSearchFocused ? 'w-full' : 'flex-1 max-w-md'
              }`}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-10 glass bg-background/50 w-full"
                />
              </div>
              
              <div className={`flex gap-2 flex-wrap transition-all duration-300 ${
                isSearchFocused 
                  ? 'opacity-0 max-h-0 overflow-hidden w-0' 
                  : 'opacity-100 max-h-20 w-auto'
              }`}>
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
            </div>
            
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ask Question
            </Button>
          </div>
        </div>

        {/* Questions List */}
        <QuestionsList 
          questions={filteredQuestions} 
          loading={loading}
          onQuestionUpdate={fetchQuestions}
        />
      </div>

      <CreateQuestionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onQuestionCreated={handleQuestionCreated}
      />
    </QuestionsLayout>
  );
};
