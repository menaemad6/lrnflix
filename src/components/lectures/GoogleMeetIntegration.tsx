import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Video, Calendar, Clock, Users, ExternalLink, Edit, Trash2, MoreVertical, ArrowLeft } from 'lucide-react';
import { CreateLectureModal } from './CreateLectureModal';
import { EditLectureModal } from './EditLectureModal';
import { useLiveLectures } from '@/hooks/useLiveLectures';
import { getLectureStatusInfo, formatLectureTime } from '@/utils/lectureUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GoogleMeetIntegrationProps {
  courseId: string;
  onBack?: () => void;
}

export const GoogleMeetIntegration = ({ courseId, onBack }: GoogleMeetIntegrationProps) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancellingLectureId, setCancellingLectureId] = useState<string | null>(null);
  const [editingLecture, setEditingLecture] = useState<any>(null);
  const [cancellingLecture, setCancellingLecture] = useState<any>(null);
  const [deletingLectureId, setDeletingLectureId] = useState<string | null>(null);
  const [deletingLecture, setDeletingLecture] = useState<any>(null);

  // Use custom hook for fetching lectures
  const { lectures, refetch: refetchLectures } = useLiveLectures(courseId);

  useEffect(() => {
    checkGoogleConnection();
  }, [courseId]);

  const checkGoogleConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('google_oauth_tokens')
        .select('id')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsConnected(!!data);
    } catch (error: any) {
      console.error('Error checking Google connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleAccount = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-oauth-initiate');
      
      if (error) throw error;

      console.log('Opening OAuth popup with URL:', data.authUrl);

      // Open OAuth popup
      const popup = window.open(
        data.authUrl,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for OAuth completion
      const messageHandler = async (event: MessageEvent) => {
        console.log('Received message in parent window:', event.data);
        
        // Only handle messages from our popup
        if (event.source !== popup) {
          return;
        }
        
        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          window.removeEventListener('message', messageHandler);
          clearInterval(checkClosed);
          
          try {
            console.log('Processing OAuth success...');
            // Save tokens to Supabase
            const { error: saveError } = await supabase.functions.invoke('save-google-tokens', {
              body: event.data.tokens
            });

            if (saveError) {
              console.error('Error saving tokens:', saveError);
              throw new Error('Failed to save Google tokens');
            }

            console.log('Tokens saved successfully');
            setIsConnected(true);
            toast({
              title: 'Success',
              description: 'Google account connected successfully!',
            });
            
            // Close popup if it's still open
            if (popup && !popup.closed) {
              popup.close();
            }
          } catch (error: any) {
            console.error('Error saving tokens:', error);
            toast({
              title: 'Error',
              description: error.message || 'Failed to save Google tokens',
              variant: 'destructive',
            });
          }
        } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
          window.removeEventListener('message', messageHandler);
          clearInterval(checkClosed);
          console.error('OAuth error:', event.data.error);
          toast({
            title: 'Error',
            description: event.data.error || 'OAuth failed',
            variant: 'destructive',
          });
          
          // Close popup if it's still open
          if (popup && !popup.closed) {
            popup.close();
          }
        }
      };

      window.addEventListener('message', messageHandler);
      
      // Clean up if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          setIsConnecting(false);
          console.log('Popup was closed manually');
        }
      }, 1000);

    } catch (error: any) {
      console.error('Error connecting Google account:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to connect Google account',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLectureCreated = () => {
    refetchLectures();
  };

  const handleLectureUpdated = () => {
    refetchLectures();
    setEditingLecture(null);
  };

  const handleCancelLecture = async (lectureId: string) => {
    setCancellingLectureId(lectureId);
    try {
      const { error } = await supabase.functions.invoke('cancel-meet-lecture', {
        body: { lecture_id: lectureId }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Live lecture cancelled successfully!',
      });

      refetchLectures();
    } catch (error: any) {
      console.error('Error cancelling lecture:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel lecture',
        variant: 'destructive',
      });
    } finally {
      setCancellingLectureId(null);
      setCancellingLecture(null);
    }
  };

  const handleDeleteLecture = async (lectureId: string) => {
    setDeletingLectureId(lectureId);
    try {
      const { error } = await supabase
        .from('live_lectures')
        .delete()
        .eq('id', lectureId);
      if (error) throw error;
      toast({
        title: 'Deleted',
        description: 'Lecture deleted successfully.',
      });
      refetchLectures();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete lecture',
        variant: 'destructive',
      });
    } finally {
      setDeletingLectureId(null);
      setDeletingLecture(null);
    }
  };

  const canEditLecture = (lecture: any) => {
    if (lecture.status === 'cancelled' || lecture.status === 'ended') return false;
    const now = new Date();
    const startTime = new Date(lecture.start_time);
    return now < startTime || (now >= startTime && now <= new Date(startTime.getTime() + lecture.duration_minutes * 60000));
  };

  const canCancelLecture = (lecture: any) => {
    // Check if lecture is not cancelled and is scheduled for the future
    if (lecture.status === 'cancelled') return false;
    
    const now = new Date();
    const startTime = new Date(lecture.start_time);
    
    // Can cancel if lecture hasn't started yet
    return now < startTime;
  };

  const canDeleteLecture = (lecture: any) => lecture.status === 'cancelled';

  if (loading) {
    return <div className="animate-pulse">Loading Google Meet integration...</div>;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="space-y-6 sm:space-y-8 relative z-10 p-4 sm:p-8">
        {/* Header */}
        <div className="card p-4 sm:p-8 border border-border bg-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              {onBack && (
                <Button 
                  variant="outline" 
                  onClick={onBack}

                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary" >
                  Live Lecture Management
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Create and manage your course's live Google Meet lectures</p>
              </div>
            </div>
            <div className="flex">
              <CreateLectureModal 
                courseId={courseId} 
                onLectureCreated={handleLectureCreated}
              />
            </div>
          </div>
        </div>
        {/* Google Account Status Card */}
        <div className="card border border-border bg-card p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
          {isConnected ? (
            <>
              <Badge className="bg-green-500">Connected</Badge>
              <span className="text-sm text-muted-foreground">Google account connected</span>
            </>
          ) : (
            <>
              <Badge className="bg-red-500">Not Connected</Badge>
              <span className="text-sm text-muted-foreground">Google account not connected</span>
            </>
          )}
        </div>
        {/* Main Content */}
        <div className="space-y-6">
          <Card className="card border border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Google Meet Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isConnected ? (
                <div className="text-center py-8">
                  <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Connect Google Account</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your Google account to create Google Meet sessions for live lectures.
                  </p>
                  <Button 
                    onClick={connectGoogleAccount} 
                    disabled={isConnecting}
                    className="btn-primary"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Google Account'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Scheduled Lectures
                      </h4>
                    </div>
                  </div>
                  
                  {lectures.length > 0 && (
                    <div className="space-y-4">
                      <div className="grid gap-4">
                        {lectures.map((lecture) => {
                          const statusInfo = getLectureStatusInfo(lecture);
                          const timeInfo = formatLectureTime(lecture.start_time, lecture.duration_minutes);
                          
                          return (
                            <Card key={lecture.id} className="card border border-border bg-card">
                              <CardContent className="p-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="space-y-2 flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-medium break-words">{lecture.title}</h5>
                                      <Badge 
                                        variant={statusInfo.badgeVariant} 
                                        className={statusInfo.badgeColor}
                                      >
                                        {statusInfo.badgeText}
                                      </Badge>
                                    </div>
                                    {lecture.description && (
                                      <p className="text-sm text-muted-foreground break-words">
                                        {lecture.description}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {timeInfo.date}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {timeInfo.startTime}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {timeInfo.duration}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {lecture.meet_link && statusInfo.canJoin && (
                                      <Button
                                        size="sm"
                                        onClick={() => window.open(lecture.meet_link, '_blank')}
                                        className="btn-primary"
                                      >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        Join Meet
                                      </Button>
                                    )}
                                    
                                    {/* Teacher Actions Dropdown */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        {canEditLecture(lecture) && (
                                          <DropdownMenuItem 
                                            onSelect={(e) => e.preventDefault()}
                                            onClick={() => setEditingLecture(lecture)}
                                          >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Lecture
                                          </DropdownMenuItem>
                                        )}
                                        
                                        {canCancelLecture(lecture) && (
                                          <DropdownMenuItem 
                                            onSelect={(e) => e.preventDefault()}
                                            onClick={() => setCancellingLecture(lecture)}
                                            className="text-red-600 focus:text-red-600"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Cancel Lecture
                                          </DropdownMenuItem>
                                        )}
                                        {canDeleteLecture(lecture) && (
                                          <DropdownMenuItem 
                                            onSelect={(e) => e.preventDefault()}
                                            onClick={() => setDeletingLecture(lecture)}
                                            className="text-red-600 focus:text-red-600"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Lecture
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Lecture Modal */}
          {editingLecture && (
            <EditLectureModal 
              lecture={editingLecture} 
              onLectureUpdated={handleLectureUpdated}
            />
          )}

          {/* Cancel Lecture Confirmation Dialog */}
          <AlertDialog open={!!cancellingLecture} onOpenChange={() => setCancellingLecture(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Live Lecture</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel "{cancellingLecture?.title}"? This action will:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Delete the Google Calendar event</li>
                    <li>Mark the lecture as cancelled</li>
                    <li>Notify enrolled students</li>
                  </ul>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Lecture</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleCancelLecture(cancellingLecture?.id)}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={cancellingLectureId === cancellingLecture?.id}
                >
                  {cancellingLectureId === cancellingLecture?.id ? 'Cancelling...' : 'Cancel Lecture'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Lecture Confirmation Dialog */}
          <AlertDialog open={!!deletingLecture} onOpenChange={() => setDeletingLecture(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Cancelled Lecture</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to permanently delete "{deletingLecture?.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Lecture</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteLecture(deletingLecture?.id)}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deletingLectureId === deletingLecture?.id}
                >
                  {deletingLectureId === deletingLecture?.id ? 'Deleting...' : 'Delete Lecture'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
