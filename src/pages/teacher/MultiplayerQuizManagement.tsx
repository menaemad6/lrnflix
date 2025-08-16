
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  ArrowLeft,
  Brain,
  Zap,
  Target,
  Clock,
  FolderOpen,
  Tag,
  Trophy,
  Users,
  BarChart3,
  Search,
  X,
  FileText,
  Loader2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { PdfQuestionExtractor } from '@/components/quizzes/PdfQuestionExtractor';
import { QuestionsList } from '@/components/quizzes/QuestionsList';
import { generateMcqOptions } from '@/utils/geminiApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Database } from '@/integrations/supabase/types';

interface Question {
  id?: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit: number;
  category: string;
  instructor_id?: string;
}

interface ExtractedQuestion {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'written';
  options?: string[];
  correct_answer?: string;
  points: number;
}

export const MultiplayerQuizManagement = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newCategory, setNewCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExtractedQuestion, setEditingExtractedQuestion] = useState<ExtractedQuestion | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatingOptionsFor, setGeneratingOptionsFor] = useState<string | null>(null);
  const [generatingSavedQuestionOptions, setGeneratingSavedQuestionOptions] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user) {
      fetchQuestions();
      fetchCategories();
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredQuestions(questions);
    } else {
      const filtered = questions.filter(q =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.options.some(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredQuestions(filtered);
    }
  }, [searchTerm, questions]);

  const fetchQuestions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('multiplayer_quiz_questions')
        .select('*')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // @ts-ignore
      const formattedQuestions: Question[] =
        (data as any)?.map((q: any) => {
          const question: Question = {
            id: q.id,
            question: q.question,
            options: Array.isArray(q.options)
              ? q.options
              : JSON.parse(q.options),
            correct_answer: q.correct_answer,
            difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
            time_limit: q.time_limit,
            category: q.category || 'General',
            instructor_id: q.instructor_id,
          };
          return question;
        }) || [];

      setQuestions(formattedQuestions);
      setFilteredQuestions(formattedQuestions);
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

  const fetchCategories = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('multiplayer_quiz_questions')
        .select('category')
        .eq('instructor_id', user.id)
        .order('category');

      if (error) throw error;

      const uniqueCategories = [...new Set(data?.map(q => q.category) || [])];
      setCategories(uniqueCategories);
    } catch (error: unknown) {
      console.error('Error fetching categories:', error);
    }
  };

  const saveQuestion = async (question: Question) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save questions.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      const questionData = {
        question: question.question,
        options: JSON.stringify(question.options),
        correct_answer: question.correct_answer,
        difficulty: question.difficulty,
        time_limit: question.time_limit,
        category: question.category || 'General',
        instructor_id: user.id,
      };

      if (question.id) {
        const { error } = await supabase
          .from('multiplayer_quiz_questions')
          .update(questionData)
          .eq('id', question.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('multiplayer_quiz_questions')
          .insert(questionData);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Question ${question.id ? 'updated' : 'created'} successfully!`,
      });

      setEditingQuestion(null);
      setEditingQuestionId(null);
      fetchQuestions();
      fetchCategories();
    } catch (error: unknown) {
      console.error('Error saving question:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('multiplayer_quiz_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Question deleted successfully',
      });

      fetchQuestions();
      fetchCategories();
    } catch (error: unknown) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const startNewQuestion = () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a question.',
        variant: 'destructive',
      });
      return;
    }
    setEditingQuestion({
      question: '',
      options: ['', '', '', ''],
      correct_answer: '',
      difficulty: 'medium',
      time_limit: 15,
      category: selectedCategory === 'all' ? 'General' : selectedCategory,
      instructor_id: user?.id,
    });
  };

  const startInlineEdit = (question: Question) => {
    setEditingQuestionId(question.id || '');
    setEditingQuestion({ ...question });
  };

  const cancelInlineEdit = () => {
    setEditingQuestionId(null);
    setEditingQuestion(null);
  };

  const updateInlineQuestion = (field: keyof Question, value: string | number | 'easy' | 'medium' | 'hard') => {
    if (editingQuestion) {
      setEditingQuestion({
        ...editingQuestion,
        [field]: value
      });
    }
  };

  const updateInlineOption = (index: number, value: string) => {
    if (editingQuestion) {
      const newOptions = [...editingQuestion.options];
      newOptions[index] = value;
      setEditingQuestion({
        ...editingQuestion,
        options: newOptions
      });
    }
  };

  const addNewCategory = async () => {
    if (!newCategory.trim()) return;
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add a category.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Add a placeholder question to establish the category
      const { error } = await supabase
        .from('multiplayer_quiz_questions')
        .insert({
          question: `Sample question for ${newCategory}`,
          options: JSON.stringify(['Option A', 'Option B', 'Option C', 'Option D']),
          correct_answer: 'Option A',
          difficulty: 'medium',
          time_limit: 15,
          category: newCategory.trim(),
          instructor_id: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Category "${newCategory}" created successfully!`,
      });

      setNewCategory('');
      fetchQuestions();
      fetchCategories();
    } catch (error: unknown) {
      console.error('Error creating category:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleQuestionsExtracted = async (questions: ExtractedQuestion[]) => {
    setExtractedQuestions(questions.map(q => ({ ...q, id: Math.random().toString(36).substring(2, 15) })));
    setIsModalOpen(false); // Close the modal after extraction
    if (questions.length === 0) return;

    setIsProcessing(true);
    toast({
      title: 'Processing Extracted Questions',
      description: 'Generating options for any questions that are missing them. Please wait...',
    });

    try {
      const processedQuestions = await Promise.all(
        questions.map(async (q) => {
          const isMcqWithoutOptions = q.question_type === 'mcq' && (!q.options || q.options.length === 0);

          if (isMcqWithoutOptions) {
            try {
              const { options, correct_answer } = await generateMcqOptions(q.question_text);
              return {
                ...q,
                id: Math.random().toString(36).substring(2, 15),
                options,
                correct_answer,
              };
            } catch (error) {
              console.error(`Failed to generate options for: "${q.question_text}"`, error);
              toast({
                title: 'Option Generation Failed',
                description: `Could not generate options for: "${q.question_text.substring(0, 30)}..."`,
                variant: 'destructive',
              });
              return { ...q, id: Math.random().toString(36).substring(2, 15), options: [] };
            }
          }
          return { ...q, id: Math.random().toString(36).substring(2, 15) };
        }),
      );

      setExtractedQuestions(processedQuestions);
      toast({
        title: 'Processing Complete',
        description: `Successfully processed ${questions.length} questions.`,
      });
    } catch (error) {
      console.error('Error processing extracted questions:', error);
      toast({
        title: 'An Error Occurred',
        description: 'Could not process all extracted questions.',
        variant: 'destructive',
      });
      setExtractedQuestions(questions.map((q) => ({ ...q, id: Math.random().toString(36).substring(2, 15) })));
    } finally {
      setIsProcessing(false);
    }
  };

  const saveExtractedQuestions = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save questions.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const newQuestions = extractedQuestions.map(q => ({
        question: q.question_text,
        options: q.options || [],
        correct_answer: q.correct_answer || '',
        difficulty: 'medium', // Default difficulty
        time_limit: 15, // Default time limit
        category: 'General', // Default category
        instructor_id: user.id,
      }));

      const { error } = await supabase.from('multiplayer_quiz_questions').insert(newQuestions);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${newQuestions.length} questions saved successfully.`,
      });

      setExtractedQuestions([]);
      fetchQuestions(); // Refresh the questions list
    } catch (error: unknown) {
      console.error('Error saving extracted questions:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleEditExtractedQuestion = (questionId: string) => {
    const questionToEdit = extractedQuestions.find(q => q.id === questionId);
    if (questionToEdit) {
      setEditingExtractedQuestion(questionToEdit);
    }
  };

  const handleUpdateExtractedQuestion = () => {
    if (editingExtractedQuestion) {
      setExtractedQuestions(prev =>
        prev.map(q => (q.id === editingExtractedQuestion.id ? editingExtractedQuestion : q))
      );
      setEditingExtractedQuestion(null);
    }
  };

  const handleDeleteExtractedQuestion = (questionId: string) => {
    setExtractedQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleGenerateOptionsForSavedQuestion = async (questionId: string) => {
    const questionToUpdate = questions.find((q) => q.id === questionId);
    if (!questionToUpdate) return;

    setGeneratingSavedQuestionOptions(questionId);
    try {
      const { options, correct_answer } = await generateMcqOptions(questionToUpdate.question);

      const updatedQuestionData: Question = {
        ...questionToUpdate,
        options,
        correct_answer,
      };

      await saveQuestion(updatedQuestionData);

      toast({
        title: 'Success',
        description: 'Options generated and saved successfully.',
      });
    } catch (error: unknown) {
      console.error('Error generating options for saved question:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate and save options.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingSavedQuestionOptions(null);
    }
  };

  const handleGenerateOptions = async (questionId: string) => {
    const questionToUpdate = extractedQuestions.find((q) => q.id === questionId);
    if (!questionToUpdate) return;

    setGeneratingOptionsFor(questionId);
    try {
      const { options, correct_answer } = await generateMcqOptions(questionToUpdate.question_text);
      setExtractedQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, options, correct_answer, question_type: 'mcq' } : q,
        ),
      );
      toast({
        title: 'Success',
        description: 'Options generated successfully.',
      });
    } catch (error) {
      console.error('Error generating options:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate options.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingOptionsFor(null);
    }
  };

  const getFilteredQuestions = () => {
    if (selectedCategory === 'all') {
      return filteredQuestions;
    }
    return filteredQuestions.filter(q => q.category === selectedCategory);
  };

  const getQuestionsByCategory = () => {
    const grouped: { [key: string]: Question[] } = {};
    filteredQuestions.forEach(question => {
      const category = question.category || 'General';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(question);
    });
    return grouped;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const displayQuestions = getFilteredQuestions();
  const questionsByCategory = getQuestionsByCategory();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <TeacherPageHeader
          title="Multiplayer Quiz Management"
          subtitle="Create and manage engaging multiplayer quiz questions by category"
          actionLabel="New Question"
          onAction={startNewQuestion}
          actionIcon={<Plus className="h-4 w-4 mr-2" />}
          actionButtonProps={{
            className: "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-black font-semibold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25 border border-emerald-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30"
          }}
        />

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Extract from PDF
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Extract Questions from PDF</DialogTitle>
            </DialogHeader>
            <PdfQuestionExtractor onQuestionsExtracted={handleQuestionsExtracted} />
          </DialogContent>
        </Dialog>

        {isProcessing && (
          <Card>
            <CardContent className="p-6 flex items-center justify-center">
              <Loader2 className="h-6 w-6 mr-2 animate-spin" />
              <p>Processing questions and generating options with AI...</p>
            </CardContent>
          </Card>
        )}

        {extractedQuestions.length > 0 && !isProcessing && (
          <QuestionsList
            questions={extractedQuestions}
            onSave={saveExtractedQuestions}
            onDiscard={() => setExtractedQuestions([])}
            onEdit={handleEditExtractedQuestion}
            onDelete={handleDeleteExtractedQuestion}
            onGenerateOptions={handleGenerateOptions}
            generatingOptionsFor={generatingOptionsFor}
          />
        )}

        {editingExtractedQuestion && (
          <Dialog open={!!editingExtractedQuestion} onOpenChange={() => setEditingExtractedQuestion(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Extracted Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label>Question Text</label>
                  <Textarea
                    value={editingExtractedQuestion.question_text}
                    onChange={(e) =>
                      setEditingExtractedQuestion({
                        ...editingExtractedQuestion,
                        question_text: e.target.value,
                      })
                    }
                  />
                </div>
                {editingExtractedQuestion.options?.map((option, index) => (
                  <div key={index}>
                    <label>Option {index + 1}</label>
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(editingExtractedQuestion.options || [])];
                        newOptions[index] = e.target.value;
                        setEditingExtractedQuestion({
                          ...editingExtractedQuestion,
                          options: newOptions,
                        });
                      }}
                    />
                  </div>
                ))}
                <div>
                  <label>Correct Answer</label>
                  <Input
                    value={editingExtractedQuestion.correct_answer || ''}
                    onChange={(e) =>
                      setEditingExtractedQuestion({
                        ...editingExtractedQuestion,
                        correct_answer: e.target.value,
                      })
                    }
                  />
                </div>
                <Button onClick={handleUpdateExtractedQuestion}>Update Question</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                  <Trophy className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                  <p className="text-2xl font-bold text-emerald-400">{questions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                  <FolderOpen className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold text-blue-400">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Quizzes</p>
                  <p className="text-2xl font-bold text-purple-400">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Management */}
        <Card className="border border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-emerald-300 flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Category Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">New Category</label>
                <Input
                  placeholder="Enter new category name..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="bg-background/50 border-border"
                />
              </div>
              <Button 
                onClick={addNewCategory}
                disabled={!newCategory.trim() || !user}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className={`cursor-pointer transition-all duration-200 ${selectedCategory === 'all' ? 'bg-emerald-500 text-black' : 'hover:bg-emerald-500/20 hover:border-emerald-500/50'}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Categories ({questions.length})
              </Badge>
              {categories.map(category => (
                <Badge 
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all duration-200 ${selectedCategory === category ? 'bg-emerald-500 text-black' : 'hover:bg-emerald-500/20 hover:border-emerald-500/50'}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category} ({questions.filter(q => q.category === category).length})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question Editor */}
        {editingQuestion && !editingQuestionId && (
          <Card className="border border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-emerald-300">
                Create New Question
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Question Text</label>
                <Textarea
                  placeholder="Enter your question..."
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({
                    ...editingQuestion,
                    question: e.target.value
                  })}
                  className="bg-background/50 border-border min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Category</label>
                  <Select
                    value={editingQuestion.category}
                    onValueChange={(value) => 
                      setEditingQuestion({
                        ...editingQuestion,
                        category: value
                      })
                    }
                  >
                    <SelectTrigger className="bg-background/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Difficulty</label>
                  <Select
                    value={editingQuestion.difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                      setEditingQuestion({
                        ...editingQuestion,
                        difficulty: value
                      })
                    }
                  >
                    <SelectTrigger className="bg-background/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Answer Options</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editingQuestion.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...editingQuestion.options];
                          newOptions[index] = e.target.value;
                          setEditingQuestion({
                            ...editingQuestion,
                            options: newOptions
                          });
                        }}
                        className="bg-background/50 border-border"
                      />
                      <Button
                        type="button"
                        variant={editingQuestion.correct_answer === option ? "default" : "outline"}
                        onClick={() => setEditingQuestion({
                          ...editingQuestion,
                          correct_answer: option
                        })}
                        className={editingQuestion.correct_answer === option 
                          ? "bg-emerald-500 text-black hover:bg-emerald-600" 
                          : "border-border hover:bg-muted"
                        }
                      >
                        Correct
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Time Limit (seconds)</label>
                <Input
                  type="number"
                  value={editingQuestion.time_limit}
                  onChange={(e) => setEditingQuestion({
                    ...editingQuestion,
                    time_limit: parseInt(e.target.value)
                  })}
                  className="bg-background/50 border-border w-32"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => saveQuestion(editingQuestion)}
                  disabled={saving || !editingQuestion.question.trim() || !editingQuestion.correct_answer}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Question'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingQuestion(null)}
                  className="border-border hover:bg-muted"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions Display */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-background/50 border-border">
            <TabsTrigger value="list" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black">List View</TabsTrigger>
            <TabsTrigger value="grouped" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black">Grouped by Category</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6 mt-6">
            {/* Questions List */}
            <div className="grid gap-6">
              {displayQuestions.map((question) => (
                <Card key={question.id} className="border border-border bg-card/50 backdrop-blur-sm group hover:border-emerald-500/50 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300 border border-emerald-500/30">
                            <Brain className="h-5 w-5 text-emerald-400" />
                          </div>
                          <div className="flex-1">
                            {editingQuestionId === question.id ? (
                              <Textarea
                                value={editingQuestion?.question || ''}
                                onChange={(e) => updateInlineQuestion('question', e.target.value)}
                                className="bg-background/50 border-border min-h-[80px] text-lg font-medium"
                                placeholder="Enter question text..."
                              />
                            ) : (
                              <h4 className="text-lg font-medium text-emerald-300 group-hover:text-emerald-400 transition-colors duration-300">
                                {question.question}
                              </h4>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40">
                                <FolderOpen className="h-3 w-3 mr-1" />
                                {editingQuestionId === question.id ? (
                                  <Select
                                    value={editingQuestion?.category || ''}
                                    onValueChange={(value) => updateInlineQuestion('category', value)}
                                  >
                                    <SelectTrigger className="h-6 bg-transparent border-0 p-0 text-blue-300">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map(category => (
                                        <SelectItem key={category} value={category}>{category}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  question.category
                                )}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        {editingQuestionId === question.id ? (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => editingQuestion && saveQuestion(editingQuestion)}
                              disabled={saving}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={cancelInlineEdit}
                              className="border-border hover:bg-muted"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => startInlineEdit(question)}
                              className="bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-emerald-300 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => question.id && deleteQuestion(question.id)}
                              className="bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 text-red-300 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {question.options.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {question.options.map((option, index) => (
                            <div
                              key={index}
                              className={`p-3 rounded-xl border transition-all duration-300 ${
                                option === question.correct_answer
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                  : 'bg-muted/30 border-border text-muted-foreground'
                              }`}
                            >
                              {editingQuestionId === question.id ? (
                                <div className="flex gap-2">
                                  <Input
                                    value={editingQuestion?.options[index] || ''}
                                    onChange={(e) => updateInlineOption(index, e.target.value)}
                                    className="bg-background/50 border-border text-sm"
                                    placeholder={`Option ${index + 1}`}
                                  />
                                  <Button
                                    type="button"
                                    variant={
                                      editingQuestion?.correct_answer === editingQuestion?.options[index]
                                        ? 'default'
                                        : 'outline'
                                    }
                                    onClick={() => updateInlineQuestion('correct_answer', editingQuestion?.options[index])}
                                    size="sm"
                                    className={
                                      editingQuestion?.correct_answer === editingQuestion?.options[index]
                                        ? 'bg-emerald-500 text-black hover:bg-emerald-600 h-8 px-2'
                                        : 'border-border hover:bg-muted h-8 px-2'
                                    }
                                  >
                                    ✓
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-sm font-medium">{String.fromCharCode(65 + index)}.</span>{' '}
                                  {option}
                                  {option === question.correct_answer && (
                                    <Badge className="ml-2 bg-emerald-500/30 text-emerald-300 border-emerald-500/50">
                                      Correct
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          <p>This question is missing options.</p>
                          <Button
                            size="sm"
                            variant="link"
                            onClick={() => handleGenerateOptionsForSavedQuestion(question.id || '')}
                            disabled={generatingSavedQuestionOptions === question.id}
                          >
                            {generatingSavedQuestionOptions === question.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              'Generate Options with AI'
                            )}
                          </Button>
                        </div>
                      )}

                      <div className="flex gap-3 flex-wrap">
                        {editingQuestionId === question.id ? (
                          <>
                            <Select
                              value={editingQuestion?.difficulty || 'medium'}
                              onValueChange={(value: 'easy' | 'medium' | 'hard') => updateInlineQuestion('difficulty', value)}
                            >
                              <SelectTrigger className="h-8 bg-background/50 border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              value={editingQuestion?.time_limit || 15}
                              onChange={(e) => updateInlineQuestion('time_limit', parseInt(e.target.value))}
                              className="bg-background/50 border-border w-20 h-8"
                            />
                          </>
                        ) : (
                          <>
                            <Badge 
                              className={
                                question.difficulty === 'easy' 
                                  ? "bg-green-500/20 text-green-300 border-green-500/40" 
                                  : question.difficulty === 'medium'
                                  ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                                  : "bg-red-500/20 text-red-300 border-red-500/40"
                              }
                            >
                              <Target className="h-3 w-3 mr-1" />
                              {question.difficulty}
                            </Badge>
                            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
                              <Clock className="h-3 w-3 mr-1" />
                              {question.time_limit}s
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {displayQuestions.length === 0 && (
              <Card className="border border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="text-center py-16 space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                    <Brain className="h-10 w-10 text-emerald-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      {searchTerm ? 'No matching questions found' : selectedCategory === 'all' ? 'No questions yet' : `No questions in ${selectedCategory}`}
                    </h3>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                      {searchTerm 
                        ? 'Try adjusting your search terms to find the right questions'
                        : selectedCategory === 'all' 
                        ? 'Create your first multiplayer quiz question to get started'
                        : `Create questions for the ${selectedCategory} category`
                      }
                    </p>
                  </div>
                  {!searchTerm && (
                    <Button 
                      onClick={startNewQuestion}
                      className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-black font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-emerald-500/25 border border-emerald-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Question
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="grouped" className="space-y-6 mt-6">
            {/* Questions Grouped by Category */}
            {Object.entries(questionsByCategory).map(([category, categoryQuestions]) => (
              <Card key={category} className="border border-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center">
                      <FolderOpen className="h-5 w-5 mr-2" />
                      {category}
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                      {categoryQuestions.length} questions
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryQuestions.map((question) => (
                      <div key={question.id} className="p-4 border border-border rounded-lg hover:border-emerald-500/50 transition-colors duration-200 bg-background/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-medium text-foreground">{question.question}</h4>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => startInlineEdit(question)}
                              className="bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-emerald-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => question.id && deleteQuestion(question.id)}
                              className="bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          {question.options.map((option, index) => (
                            <div 
                              key={index} 
                              className={`p-2 rounded-lg text-sm ${
                                option === question.correct_answer 
                                  ? 'bg-emerald-500/20 text-emerald-300' 
                                  : 'bg-muted/30 text-muted-foreground'
                              }`}
                            >
                              <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-3 flex-wrap">
                          <Badge 
                            className={
                              question.difficulty === 'easy' 
                                ? "bg-green-500/20 text-green-300 border-green-500/40" 
                                : question.difficulty === 'medium'
                                ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                                : "bg-red-500/20 text-red-300 border-red-500/40"
                            }
                          >
                            <Target className="h-3 w-3 mr-1" />
                            {question.difficulty}
                          </Badge>
                          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
                            <Clock className="h-3 w-3 mr-1" />
                            {question.time_limit}s
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
