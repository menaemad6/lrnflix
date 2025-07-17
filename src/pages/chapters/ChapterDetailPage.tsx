import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  CheckCircle,
  Users,
  Star,
  ArrowRight,
  Trophy,
  Globe,
  User,
  Calendar
} from 'lucide-react';
import { useRandomBackground } from "../../hooks/useRandomBackground";

interface Chapter {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  created_at: string;
  cover_image_url?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  instructor_id: string;
  profiles?: {
    full_name: string;
  };
}

export const ChapterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userWallet, setUserWallet] = useState(0);
  const navigate = useNavigate();
  const bgClass = useRandomBackground();
  const [chapterCourses, setChapterCourses] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchChapterData();
      fetchUserWallet();
    }
  }, [id]);

  const fetchUserWallet = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('wallet')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserWallet(profile.wallet);
        }
      }
    } catch (error) {
      console.error('Error fetching user wallet:', error);
    }
  };

  const fetchChapterData = async () => {
    try {
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (chapterError) throw chapterError;
      setChapter(chapterData);

      // Check enrollment
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: enrollment } = await supabase
          .from('chapter_enrollments')
          .select('*')
          .eq('chapter_id', id)
          .eq('student_id', user.id)
          .maybeSingle();

        setIsEnrolled(!!enrollment);
      }

      // Fetch courses for this chapter using chapter_objects
      const { data: objectsData, error: objectsError } = await supabase
        .from('chapter_objects')
        .select('*, course:courses!object_id(*)')
        .eq('chapter_id', id)
        .eq('object_type', 'course');
      if (objectsError) throw objectsError;
      setChapterCourses(objectsData || []);

    } catch (error: unknown) {
      console.error('Error fetching chapter:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chapter',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseChapter = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result = await supabase.rpc('enroll_chapter_with_payment', {
        p_chapter_id: id
      });

      if (result.error) throw result.error;

      const response = result.data as any;
      if (response?.success) {
        toast({
          title: 'Success',
          description: response.message,
        });
        setIsEnrolled(true);
        fetchChapterData();
        fetchUserWallet();
      } else {
        toast({
          title: 'Error',
          description: response?.error || 'Failed to enroll',
          variant: 'destructive',
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error purchasing chapter:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex items-center justify-center p-6">
        <Card className="glass-card border-white/10 shadow-2xl backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
              Chapter Not Found
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mt-4">
              The chapter you're looking for doesn't exist or may have been removed.
            </p>
            <div className="flex gap-4 mt-8 justify-center">
              <Button onClick={() => navigate('/chapters')}>
                Browse Chapters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={bgClass + " min-h-screen"}>
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5"></div>
        
        <div className="relative container mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Chapter Header */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
                    Chapter
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    4.8
                  </Badge>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent leading-tight">
                  {chapter.title}
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                  {chapter.description}
                </p>

                {/* Chapter Stats */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{chapterCourses.length} courses included</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(chapter.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>English</span>
                  </div>
                </div>

                {isEnrolled && (
                  <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <Trophy className="h-6 w-6 text-green-500" />
                        <div>
                          <h3 className="font-semibold text-green-700 dark:text-green-300">Enrolled Successfully!</h3>
                          <p className="text-sm text-green-600 dark:text-green-400">You now have access to all courses in this chapter</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Courses List */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Courses in this Chapter</h2>
                <div className="space-y-4">
                  {chapterCourses.map((obj, index) => (
                    <Card key={obj.id} className="glass-card hover-glow group">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-lg font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                              {obj.course?.title || obj.title || 'Unknown Course'}
                            </h3>
                            <p className="text-muted-foreground text-sm mt-1">
                              {obj.course?.description || obj.description || ''}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              {obj.course?.category && (
                                <Badge variant="outline" className="text-xs">
                                  {obj.course.category}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                by {obj.course?.profiles?.full_name || 'Unknown'}
                              </span>
                            </div>
                          </div>
                          {isEnrolled && obj.course?.id && (
                            <Link to={`/courses/${obj.course.id}`}>
                              <Button variant="outline" className="glass">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="glass-card sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold gradient-text">
                      {chapter.price} credits
                    </div>
                    <p className="text-sm text-muted-foreground">
                      One-time payment for lifetime access
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Access to {chapterCourses.length} courses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Certificate of completion</span>
                    </div>
                  </div>

                  {isEnrolled ? (
                    <Button disabled className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Already Enrolled
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        onClick={handlePurchaseChapter}
                        className="w-full btn-primary"
                        disabled={userWallet < chapter.price}
                      >
                        {userWallet < chapter.price ? 'Insufficient Credits' : 'Enroll Now'}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Your balance: {userWallet} credits
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};