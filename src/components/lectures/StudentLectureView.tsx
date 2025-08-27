import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Clock, Users, ExternalLink } from 'lucide-react';
import { useLiveLectures } from '@/hooks/useLiveLectures';
import { getLectureStatusInfo, formatLectureTime } from '@/utils/lectureUtils';

interface StudentLectureViewProps {
  courseId: string;
  isEnrolled?: boolean;
}

export const StudentLectureView = ({ courseId, isEnrolled }: StudentLectureViewProps) => {
  const { lectures, loading, error } = useLiveLectures(courseId);

  if (loading) {
    return <div className="animate-pulse">Loading lectures...</div>;
  }

  if (error) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="text-center py-12">
          <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Lectures</h3>
          <p className="text-muted-foreground">
            {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (lectures.length === 0) {
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="text-center py-12">
          <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Live Lectures</h3>
          <p className="text-muted-foreground">
            No live lectures are currently scheduled for this course.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Video className="h-4 w-4 sm:h-5 sm:w-5" />
            Live Lectures
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 sm:gap-4">
            {lectures.map((lecture) => {
              const statusInfo = getLectureStatusInfo(lecture);
              const timeInfo = formatLectureTime(lecture.start_time, lecture.duration_minutes);
              
              return (
                <Card key={lecture.id} className="glass-card border-white/10">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h5 className="font-medium text-sm sm:text-base break-words">{lecture.title}</h5>
                          <Badge 
                            variant={statusInfo.badgeVariant} 
                            className={`${statusInfo.badgeColor} text-xs w-fit`}
                          >
                            {statusInfo.badgeText}
                          </Badge>
                        </div>
                        {lecture.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">
                            {lecture.description}
                          </p>
                        )}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="break-words">{timeInfo.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span>{timeInfo.startTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 flex-shrink-0" />
                            <span>{timeInfo.duration}</span>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">
                          {statusInfo.message}
                        </p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {isEnrolled && statusInfo.canJoin && lecture.meet_link ? (
                          <Button
                            onClick={() => window.open(lecture.meet_link, '_blank')}
                            className="btn-primary w-full sm:w-auto text-xs sm:text-sm"
                          >
                            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Join Live
                          </Button>
                        ) : (
                          <Button disabled variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                            {lecture.meet_link ? (isEnrolled ? 'Not Started' : 'Enroll to Join') : 'No Link'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
