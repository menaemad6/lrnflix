
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
  Image as ImageIcon,
  FileJson,
  Download,
  Upload,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { PdfQuestionExtractor } from '@/components/quizzes/PdfQuestionExtractor';
import { ImageQuestionExtractor } from '@/components/quizzes/ImageQuestionExtractor';
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
import { useMultiplayerQuizQuestions, useMultiplayerQuizCategories } from '@/lib/queries';
import { SEOHead } from '@/components/seo';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('teacher');
  const { toast } = useToast();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: questions = [], isLoading: loading, refetch: fetchQuestions } = useMultiplayerQuizQuestions(user?.id || '');
  const { data: categories = [], refetch: fetchCategories } = useMultiplayerQuizCategories(user?.id || '');
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newCategory, setNewCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExtractedQuestion, setEditingExtractedQuestion] = useState<ExtractedQuestion | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatingOptionsFor, setGeneratingOptionsFor] = useState<string | null>(null);
  const [generatingSavedQuestionOptions, setGeneratingSavedQuestionOptions] = useState<string | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGeneratingModalOptions, setIsGeneratingModalOptions] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

  const saveQuestion = async (question: Question) => {
    if (!user) {
      toast({
        title: t('multiplayerQuiz.error'),
        description: t('multiplayerQuiz.mustBeLoggedIn', { action: 'save questions' }),
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
        title: t('multiplayerQuiz.success'),
        description: question.id ? t('multiplayerQuiz.questionUpdatedSuccessfully') : t('multiplayerQuiz.questionCreatedSuccessfully'),
      });

      fetchQuestions();
      fetchCategories();
    } catch (error: unknown) {
      console.error('Error saving question:', error);
      toast({
        title: t('multiplayerQuiz.error'),
        description: error instanceof Error ? error.message : t('multiplayerQuiz.unknownError'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm(t('multiplayerQuiz.confirmDeleteQuestion'))) return;

    try {
      const { error } = await supabase
        .from('multiplayer_quiz_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('multiplayerQuiz.success'),
        description: t('multiplayerQuiz.questionDeletedSuccessfully'),
      });

      fetchQuestions();
      fetchCategories();
    } catch (error: unknown) {
      console.error('Error deleting question:', error);
      toast({
        title: t('multiplayerQuiz.error'),
        description: error instanceof Error ? error.message : t('multiplayerQuiz.unknownError'),
        variant: 'destructive',
      });
    }
  };

  const startNewQuestion = () => {
    if (!user) {
      toast({
        title: t('multiplayerQuiz.error'),
        description: t('multiplayerQuiz.mustBeLoggedIn', { action: 'create a question' }),
        variant: 'destructive',
      });
      return;
    }
    setModalQuestion({
      question: '',
      options: ['', '', '', ''],
      correct_answer: '',
      difficulty: 'medium',
      time_limit: 15,
      category: selectedCategory === 'all' ? 'General' : selectedCategory,
      instructor_id: user?.id,
    });
    setIsEditMode(false);
    setIsQuestionModalOpen(true);
  };

  const startInlineEdit = (question: Question) => {
    setModalQuestion({ ...question });
    setIsEditMode(true);
    setIsQuestionModalOpen(true);
  };

  const handleModalSave = async () => {
    if (modalQuestion) {
      await saveQuestion(modalQuestion);
      setIsQuestionModalOpen(false);
      setModalQuestion(null);
      setIsEditMode(false);
    }
  };

  const handleModalCancel = () => {
    setIsQuestionModalOpen(false);
    setModalQuestion(null);
    setIsEditMode(false);
  };

  const handleGenerateModalOptions = async () => {
    if (!modalQuestion?.question.trim()) {
      toast({
        title: t('multiplayerQuiz.error'),
        description: t('multiplayerQuiz.pleaseEnterQuestionFirst'),
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingModalOptions(true);
    try {
      const { options, correct_answer } = await generateMcqOptions(modalQuestion.question);
      setModalQuestion({
        ...modalQuestion,
        options,
        correct_answer,
      });
      toast({
        title: t('multiplayerQuiz.success'),
        description: t('multiplayerQuiz.optionsGeneratedSuccessfully'),
      });
    } catch (error) {
      console.error('Error generating options:', error);
      toast({
        title: t('multiplayerQuiz.error'),
        description: t('multiplayerQuiz.failedToGenerateOptions'),
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingModalOptions(false);
    }
  };





  const addNewCategory = async () => {
    if (!newCategory.trim()) return;
    if (!user) {
      toast({
        title: t('multiplayerQuiz.error'),
        description: t('multiplayerQuiz.mustBeLoggedIn', { action: 'add a category' }),
        variant: 'destructive',
      });
      return;
    }

    try {
      // Add a placeholder question to establish the category
      const { error } = await supabase
        .from('multiplayer_quiz_questions')
        .insert({
          question: t('multiplayerQuiz.sampleQuestionForCategory', { category: newCategory }),
          options: JSON.stringify([t('multiplayerQuiz.optionA'), t('multiplayerQuiz.optionB'), t('multiplayerQuiz.optionC'), t('multiplayerQuiz.optionD')]),
          correct_answer: t('multiplayerQuiz.optionA'),
          difficulty: 'medium',
          time_limit: 15,
          category: newCategory.trim(),
          instructor_id: user.id,
        });

      if (error) throw error;

      toast({
        title: t('multiplayerQuiz.success'),
        description: t('multiplayerQuiz.categoryCreatedSuccessfully', { category: newCategory }),
      });

      setNewCategory('');
      fetchQuestions();
      fetchCategories();
    } catch (error: unknown) {
      console.error('Error creating category:', error);
      toast({
        title: t('multiplayerQuiz.error'),
        description: error instanceof Error ? error.message : t('multiplayerQuiz.unknownError'),
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
      title: t('multiplayerQuiz.processingExtractedQuestions'),
      description: t('multiplayerQuiz.generatingOptionsDescription'),
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
                title: t('multiplayerQuiz.optionGenerationFailed'),
                description: t('multiplayerQuiz.couldNotGenerateOptions', { question: q.question_text.substring(0, 30) }),
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
        title: t('multiplayerQuiz.processingComplete'),
        description: t('multiplayerQuiz.successfullyProcessed', { count: questions.length }),
      });
    } catch (error) {
      console.error('Error processing extracted questions:', error);
      toast({
        title: t('multiplayerQuiz.anErrorOccurred'),
        description: t('multiplayerQuiz.couldNotProcessQuestions'),
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
        title: t('multiplayerQuiz.error'),
        description: t('multiplayerQuiz.mustBeLoggedIn', { action: 'save questions' }),
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
        title: t('multiplayerQuiz.success'),
        description: t('multiplayerQuiz.questionsSavedSuccessfully', { count: newQuestions.length }),
      });

      setExtractedQuestions([]);
      fetchQuestions(); // Refresh the questions list
    } catch (error: unknown) {
      console.error('Error saving extracted questions:', error);
      toast({
        title: t('multiplayerQuiz.error'),
        description: error instanceof Error ? error.message : t('multiplayerQuiz.unknownError'),
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
        title: t('multiplayerQuiz.success'),
        description: t('multiplayerQuiz.optionsGeneratedAndSaved'),
      });
    } catch (error: unknown) {
      console.error('Error generating options for saved question:', error);
      toast({
        title: t('multiplayerQuiz.error'),
        description: error instanceof Error ? error.message : t('multiplayerQuiz.failedToGenerateAndSave'),
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
        title: t('multiplayerQuiz.success'),
        description: t('multiplayerQuiz.optionsGeneratedSuccessfully'),
      });
    } catch (error) {
      console.error('Error generating options:', error);
      toast({
        title: t('multiplayerQuiz.error'),
        description: t('multiplayerQuiz.failedToGenerateOptions'),
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const displayQuestions = getFilteredQuestions();
  const questionsByCategory = getQuestionsByCategory();

  // JSON Export Functions
  const exportQuestionsAsJson = (questionsToExport: Question[] = filteredQuestions) => {
    const exportData = questionsToExport.map(q => ({
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      difficulty: q.difficulty,
      time_limit: q.time_limit,
      category: q.category
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `multiplayer_quiz_questions_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: t('multiplayerQuiz.exportSuccess'),
      description: t('multiplayerQuiz.questionsExportedSuccessfully', { count: questionsToExport.length }),
    });
  };

            const exportQuestionsByCategory = (category: string) => {
            const categoryQuestions = questions.filter(q => q.category === category);
            if (categoryQuestions.length === 0) {
              toast({
                title: t('multiplayerQuiz.noQuestionsInCategory'),
                description: t('multiplayerQuiz.cannotExportEmptyCategory'),
                variant: 'destructive',
              });
              return;
            }
            exportQuestionsAsJson(categoryQuestions);
          };

          // JSON Import Function
          const handleJsonImport = () => {
            try {
              const parsedData = JSON.parse(jsonInput);
              if (!Array.isArray(parsedData)) {
                throw new Error('JSON must be an array of questions');
              }

              const newQuestions: Question[] = parsedData.map((item, index) => {
                if (!item.question || !item.correct_answer) {
                  throw new Error(`Question ${index + 1} is missing required fields`);
                }

                return {
                  question: item.question,
                  options: Array.isArray(item.options) ? item.options : ['', '', '', ''],
                  correct_answer: item.correct_answer,
                  difficulty: item.difficulty || 'medium',
                  time_limit: item.time_limit || 15,
                  category: item.category || 'General',
                  instructor_id: user?.id
                };
              });

              // Add questions to the database
              const addQuestionsPromises = newQuestions.map(async (question) => {
                const { error } = await supabase
                  .from('multiplayer_quiz_questions')
                  .insert([question]);
                
                if (error) throw error;
              });

              Promise.all(addQuestionsPromises).then(() => {
                setJsonInput('');
                setIsImportModalOpen(false);
                fetchQuestions();
                fetchCategories();
                toast({
                  title: t('multiplayerQuiz.importSuccess'),
                  description: t('multiplayerQuiz.questionsImportedSuccessfully', { count: newQuestions.length }),
                });
              }).catch((error) => {
                throw error;
              });

            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
              toast({
                title: t('multiplayerQuiz.importError'),
                description: errorMessage,
                variant: 'destructive',
              });
            }
          };

  return (
    <>
      <SEOHead />
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <TeacherPageHeader
            title={t('multiplayerQuiz.title')}
            subtitle={t('multiplayerQuiz.subtitle')}
            actionLabel={t('multiplayerQuiz.newQuestion')}
            onAction={startNewQuestion}
            actionIcon={<Plus className="h-4 w-4 mr-2" />}
            actionButtonProps={{
              className: "bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 hover:from-primary-600 hover:via-secondary-600 hover:to-primary-700 text-black font-semibold px-6 py-3 rounded-xl shadow-lg shadow-primary-500/25 border border-primary-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/30"
            }}
          />

          {/* Question Modal */}
          <Dialog open={isQuestionModalOpen} onOpenChange={setIsQuestionModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl text-primary-600">
                  {isEditMode ? t('multiplayerQuiz.editQuestion') : t('multiplayerQuiz.createNewQuestion')}
                </DialogTitle>
              </DialogHeader>
              {modalQuestion && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('multiplayerQuiz.questionTextLabel')}</label>
                    <div className="space-y-3">
                      <Textarea
                        placeholder={t('multiplayerQuiz.questionTextPlaceholder')}
                        value={modalQuestion.question}
                        onChange={(e) => setModalQuestion({
                          ...modalQuestion,
                          question: e.target.value
                        })}
                        className="bg-background/90 border-border min-h-[100px]"
                      />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGenerateModalOptions}
                          disabled={isGeneratingModalOptions || !modalQuestion.question.trim()}
                          className="bg-primary-500/20 border-primary-500/50 hover:bg-primary-500/30 hover:border-primary-500/60 text-primary-700"
                        >
                          {isGeneratingModalOptions ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {t('multiplayerQuiz.generating')}
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4 mr-2" />
                              {t('multiplayerQuiz.generateOptionsWithAI')}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('multiplayerQuiz.categoryLabel')}</label>
                      <Select
                        value={modalQuestion.category}
                        onValueChange={(value) => 
                          setModalQuestion({
                            ...modalQuestion,
                            category: value
                          })
                        }
                      >
                        <SelectTrigger className="bg-background/90 border-border">
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
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('multiplayerQuiz.difficultyLabel')}</label>
                      <Select
                        value={modalQuestion.difficulty}
                        onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                          setModalQuestion({
                            ...modalQuestion,
                            difficulty: value
                          })
                        }
                      >
                        <SelectTrigger className="bg-background/90 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">{t('multiplayerQuiz.easy')}</SelectItem>
                          <SelectItem value="medium">{t('multiplayerQuiz.medium')}</SelectItem>
                          <SelectItem value="hard">{t('multiplayerQuiz.hard')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('multiplayerQuiz.answerOptions')}</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {modalQuestion.options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`${t('multiplayerQuiz.option')} ${index + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...modalQuestion.options];
                              newOptions[index] = e.target.value;
                              setModalQuestion({
                                ...modalQuestion,
                                options: newOptions
                              });
                            }}
                            className="bg-background/90 border-border"
                          />
                          <Button
                            type="button"
                            variant={modalQuestion.correct_answer === option ? "default" : "outline"}
                            onClick={() => setModalQuestion({
                              ...modalQuestion,
                              correct_answer: option
                            })}
                            className={modalQuestion.correct_answer === option 
                              ? "bg-primary-500 text-black hover:bg-primary-600" 
                              : "border-border hover:bg-muted"
                            }
                          >
                            {t('multiplayerQuiz.correct')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('multiplayerQuiz.timeLimitSeconds')}</label>
                    <Input
                      type="number"
                      value={modalQuestion.time_limit}
                      onChange={(e) => setModalQuestion({
                        ...modalQuestion,
                        time_limit: parseInt(e.target.value)
                      })}
                      className="bg-background/90 border-border w-32"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleModalSave}
                      disabled={saving || !modalQuestion.question.trim() || !modalQuestion.correct_answer}
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-black"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? t('multiplayerQuiz.saving') : t('multiplayerQuiz.saveQuestion')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleModalCancel}
                      className="border-border hover:bg-muted"
                    >
                      {t('multiplayerQuiz.cancel')}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <div className="flex gap-2">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  {t('multiplayerQuiz.extractFromPdf')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('multiplayerQuiz.extractQuestionsFromPdf')}</DialogTitle>
                </DialogHeader>
                <PdfQuestionExtractor onQuestionsExtracted={handleQuestionsExtracted} />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Extract from Image
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Extract Questions from Image</DialogTitle>
                </DialogHeader>
                <ImageQuestionExtractor onQuestionsExtracted={handleQuestionsExtracted} />
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              onClick={() => setIsImportModalOpen(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Import from JSON
            </Button>

            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl text-primary-600">
                    {t('multiplayerQuiz.importQuestionsFromJson')}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                                      <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                          {t('multiplayerQuiz.jsonFormat')}
                        </label>
                        <Textarea
                          placeholder={t('multiplayerQuiz.jsonPlaceholder')}
                          value={jsonInput}
                          onChange={(e) => setJsonInput(e.target.value)}
                          rows={12}
                          className="bg-background/90 border-border font-mono text-sm"
                        />
                      </div>
                      
                      {/* Import Format Info */}
                      <div className="p-4 border border-border rounded-lg bg-muted/30">
                        <h4 className="text-sm font-medium text-foreground mb-2">
                          {t('multiplayerQuiz.importFormat')}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {t('multiplayerQuiz.importFormatDescription')}
                        </p>
                        <div className="p-3 bg-background/80 rounded border text-xs font-mono text-muted-foreground">
                          {`[
  {
    "question": "What is 2+2?",
    "options": ["3", "4", "5", "6"],
    "correct_answer": "4",
    "difficulty": "easy",
    "time_limit": 15,
    "category": "Math"
  }
]`}
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const sampleData = [
                                {
                                  question: "What is 2+2?",
                                  options: ["3", "4", "5", "6"],
                                  correct_answer: "4",
                                  difficulty: "easy",
                                  time_limit: 15,
                                  category: "Math"
                                },
                                {
                                  question: "What is the capital of France?",
                                  options: ["London", "Berlin", "Paris", "Madrid"],
                                  correct_answer: "Paris",
                                  difficulty: "medium",
                                  time_limit: 20,
                                  category: "Geography"
                                }
                              ];
                              const dataStr = JSON.stringify(sampleData, null, 2);
                              const dataBlob = new Blob([dataStr], { type: 'application/json' });
                              const url = URL.createObjectURL(dataBlob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = 'sample_questions.json';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                            }}
                            className="text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            {t('multiplayerQuiz.downloadSample')}
                          </Button>
                        </div>
                      </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsImportModalOpen(false)}
                      >
                        {t('multiplayerQuiz.cancel')}
                      </Button>
                      <Button
                        onClick={handleJsonImport}
                        disabled={!jsonInput.trim()}
                        className="bg-primary-500 hover:bg-primary-600 text-white"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {t('multiplayerQuiz.importQuestions')}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isProcessing && (
            <Card className="border border-border bg-card/90 backdrop-blur-sm shadow-sm">
              <CardContent className="p-6 flex items-center justify-center">
                <Loader2 className="h-6 w-6 mr-2 animate-spin text-primary-600" />
                <p className="text-foreground">{t('multiplayerQuiz.processingQuestions')}</p>
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
                  <DialogTitle>{t('multiplayerQuiz.editExtractedQuestion')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label>{t('multiplayerQuiz.questionText')}</label>
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
                      <label>{t('multiplayerQuiz.option')} {index + 1}</label>
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
                    <label>{t('multiplayerQuiz.correctAnswer')}</label>
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
                  <Button onClick={handleUpdateExtractedQuestion}>{t('multiplayerQuiz.updateQuestion')}</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t('multiplayerQuiz.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-border bg-card/90 backdrop-blur-sm shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500/30 to-secondary-500/30 rounded-xl flex items-center justify-center border border-primary-500/50">
                    <Trophy className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('multiplayerQuiz.totalQuestions')}</p>
                    <p className="text-2xl font-bold text-primary-600">{questions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card/90 backdrop-blur-sm shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-accent-500/30 rounded-xl flex items-center justify-center border border-blue-500/50">
                    <FolderOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('multiplayerQuiz.categories')}</p>
                    <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card/90 backdrop-blur-sm shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center border border-purple-500/50">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('multiplayerQuiz.activeQuizzes')}</p>
                    <p className="text-2xl font-bold text-purple-600">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Management */}
          <Card className="border border-border bg-card/90 backdrop-blur-sm shadow-sm">
            <CardHeader>
                              <CardTitle className="text-xl text-primary-600 flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  {t('multiplayerQuiz.categoryManagement')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('multiplayerQuiz.newCategory')}</label>
                                      <Input
                      placeholder={t('multiplayerQuiz.newCategoryPlaceholder')}
                      value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="bg-background/90 border-border"
                  />
                </div>
                <Button 
                  onClick={addNewCategory}
                  disabled={!newCategory.trim() || !user}
                 variant='default'
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('multiplayerQuiz.addCategory')}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all duration-200 ${selectedCategory === 'all' ? 'bg-primary-500 text-black' : 'hover:bg-primary-500/30 hover:border-primary-500/60'}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  {t('multiplayerQuiz.allCategories')} ({questions.length})
                </Badge>
                {categories.map(category => (
                  <Badge 
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all duration-200 ${selectedCategory === category ? 'bg-primary-500 text-black' : 'hover:bg-primary-500/30 hover:border-primary-500/60'}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category} ({questions.filter(q => q.category === category).length})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>



          {/* Questions Display */}
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-background/90 border-border shadow-sm">
              <TabsTrigger value="list" className="data-[state=active]:bg-primary-500 data-[state=active]:text-black">{t('multiplayerQuiz.listView')}</TabsTrigger>
              <TabsTrigger value="grouped" className="data-[state=active]:bg-primary-500 data-[state=active]:text-black">{t('multiplayerQuiz.groupedByCategory')}</TabsTrigger>
              <TabsTrigger value="export" className="data-[state=active]:bg-primary-500 data-[state=active]:text-black">{t('multiplayerQuiz.export')}</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-6 mt-6">
              {/* Questions List */}
              <div className="grid gap-6">
                {displayQuestions.map((question) => (
                  <Card key={question.id} className="border border-border bg-card/90 backdrop-blur-sm shadow-sm group hover:border-primary-500/50 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500/30 to-secondary-500/30 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300 border border-primary-500/50">
                              <Brain className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-foreground group-hover:text-primary-600 transition-colors duration-300">
                                {question.question}
                              </h4>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className="bg-blue-500/30 text-blue-700 border-blue-500/50">
                                  <FolderOpen className="h-3 w-3 mr-1" />
                                  {question.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => startInlineEdit(question)}
                            className="bg-primary-500/20 border-primary-500/50 hover:bg-primary-500/30 hover:border-primary-500/60 text-primary-700 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => question.id && deleteQuestion(question.id)}
                            className="bg-red-500/20 border-red-500/50 hover:bg-red-500/30 hover:border-red-500/60 text-red-700 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                                    ? 'bg-primary-500/30 border-primary-500/60 text-primary-700'
                                    : 'bg-muted/60 border-border text-foreground'
                                }`}
                              >
                                <>
                                  <span className="text-sm font-medium">{String.fromCharCode(65 + index)}.</span>{' '}
                                  {option}
                                  {option === question.correct_answer && (
                                    <Badge className="ml-2 bg-primary-500/40 text-primary-700 border-primary-500/60">
                                      {t('multiplayerQuiz.correct')}
                                    </Badge>
                                  )}
                                </>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground py-4">
                            <p>{t('multiplayerQuiz.thisQuestionMissingOptions')}</p>
                            <Button
                              size="sm"
                              variant="link"
                              onClick={() => handleGenerateOptionsForSavedQuestion(question.id || '')}
                              disabled={generatingSavedQuestionOptions === question.id}
                            >
                              {generatingSavedQuestionOptions === question.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  {t('multiplayerQuiz.generating')}
                                </>
                              ) : (
                                t('multiplayerQuiz.generateOptionsWithAI')
                              )}
                            </Button>
                          </div>
                        )}

                        <div className="flex gap-3 flex-wrap">
                          <Badge 
                            className={
                              question.difficulty === 'easy' 
                                ? "bg-green-500/30 text-green-700 border-green-500/50" 
                                : question.difficulty === 'medium'
                                ? "bg-yellow-500/30 text-yellow-700 border-yellow-500/50"
                                : "bg-red-500/30 text-red-700 border-red-500/50"
                            }
                          >
                            <Target className="h-3 w-3 mr-1" />
                            {question.difficulty}
                          </Badge>
                          <Badge className="bg-accent-500/30 text-accent-700 border-accent-500/50">
                            <Clock className="h-3 w-3 mr-1" />
                            {question.time_limit}s
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {displayQuestions.length === 0 && (
                <Card className="border border-border bg-card/90 backdrop-blur-sm shadow-sm">
                  <CardContent className="text-center py-16 space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500/30 to-secondary-500/30 rounded-2xl flex items-center justify-center mx-auto border border-primary-500/50">
                      <Brain className="h-10 w-10 text-primary-600" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        {searchTerm ? t('multiplayerQuiz.noMatchingQuestionsFound') : selectedCategory === 'all' ? t('multiplayerQuiz.noQuestionsYet') : t('multiplayerQuiz.noQuestionsInCategory', { category: selectedCategory })}
                      </h3>
                      <p className="text-foreground text-lg max-w-md mx-auto leading-relaxed">
                        {searchTerm 
                          ? t('multiplayerQuiz.tryAdjustingSearchTerms')
                          : selectedCategory === 'all' 
                          ? t('multiplayerQuiz.createFirstQuestion')
                          : t('multiplayerQuiz.createQuestionsForCategory', { category: selectedCategory })
                        }
                      </p>
                    </div>
                    {!searchTerm && (
                      <Button 
                        onClick={startNewQuestion}
                        className="bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 hover:from-primary-600 hover:via-secondary-600 hover:to-primary-700 text-black font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-primary-500/25 border border-primary-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/30"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        {t('multiplayerQuiz.createQuestion')}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="grouped" className="space-y-6 mt-6">
              {/* Questions Grouped by Category */}
              {Object.entries(questionsByCategory).map(([category, categoryQuestions]) => (
                <Card key={category} className="border border-border bg-card/90 backdrop-blur-sm shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-primary-600 flex items-center justify-between">
                      <div className="flex items-center">
                        <FolderOpen className="h-5 w-5 mr-2" />
                        {category}
                      </div>
                      <Badge className="bg-primary-500/30 text-primary-700 border-primary-500/50">
                        {categoryQuestions.length} {t('multiplayerQuiz.questions')}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryQuestions.map((question) => (
                        <div key={question.id} className="p-4 border border-border rounded-lg hover:border-primary-500/50 transition-colors duration-200 bg-background/80">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-medium text-foreground">{question.question}</h4>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => startInlineEdit(question)}
                                className="bg-primary-500/20 border-primary-500/50 hover:bg-primary-500/30 hover:border-primary-500/60 text-primary-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => question.id && deleteQuestion(question.id)}
                                className="bg-red-500/20 border-red-500/50 hover:bg-red-500/30 hover:border-red-500/60 text-red-700"
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
                                    ? 'bg-primary-500/20 text-primary-300' 
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
                            <Badge className="bg-accent-500/20 text-accent-300 border-accent-500/40">
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

            <TabsContent value="export" className="space-y-6 mt-6">
              {/* JSON Export Section */}
              <Card className="border border-border bg-card/90 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-primary-600 flex items-center gap-2">
                    <FileJson className="h-5 w-5" />
                    {t('multiplayerQuiz.exportQuestions')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Export All Questions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background/80">
                      <div className="space-y-2">
                        <h4 className="text-lg font-medium text-foreground">
                          {t('multiplayerQuiz.exportAllQuestions')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t('multiplayerQuiz.exportAllQuestionsDescription', { count: filteredQuestions.length })}
                        </p>
                      </div>
                      <Button
                        onClick={() => exportQuestionsAsJson()}
                        disabled={filteredQuestions.length === 0}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {t('multiplayerQuiz.exportAll')}
                      </Button>
                    </div>
                  </div>

                  {/* Export by Category */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-foreground">
                      {t('multiplayerQuiz.exportByCategory')}
                    </h4>
                    <div className="grid gap-3">
                      {Object.entries(questionsByCategory).map(([category, categoryQuestions]) => (
                        <div key={category} className="flex items-center justify-between p-4 border border-border rounded-lg bg-background/80">
                          <div className="space-y-2">
                            <h5 className="font-medium text-foreground">{category}</h5>
                            <p className="text-sm text-muted-foreground">
                              {t('multiplayerQuiz.questionsInCategory', { count: categoryQuestions.length })}
                            </p>
                          </div>
                          <Button
                            onClick={() => exportQuestionsByCategory(category)}
                            disabled={categoryQuestions.length === 0}
                            variant="outline"
                            className="border-primary-500 text-primary-700 hover:bg-primary-500 hover:text-white"
                          >
                            <FileJson className="h-4 w-4 mr-2" />
                            {t('multiplayerQuiz.exportCategory')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Export Format Info */}
                  <div className="p-4 border border-border rounded-lg bg-muted/30">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      {t('multiplayerQuiz.exportFormat')}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t('multiplayerQuiz.exportFormatDescription')}
                    </p>
                    <div className="mt-3 p-3 bg-background/80 rounded border text-xs font-mono text-muted-foreground">
                      {`[
  {
    "question": "What is 2+2?",
    "options": ["3", "4", "5", "6"],
    "correct_answer": "4",
    "difficulty": "easy",
    "time_limit": 15,
    "category": "Math"
  }
]`}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};
