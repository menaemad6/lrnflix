interface LiveLecture {
  id: string;
  course_id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  start_time: string;
  duration_minutes: number;
  google_event_id: string | null;
  meet_link: string | null;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface LectureStatusInfo {
  badgeVariant: 'outline' | 'default' | 'secondary';
  badgeText: string;
  badgeColor?: string;
  canJoin: boolean;
  message: string;
  status: 'upcoming' | 'live' | 'ended';
}

export const getLectureStatusInfo = (lecture: LiveLecture): LectureStatusInfo => {
  // First check if lecture is cancelled
  if (lecture.status === 'cancelled') {
    return {
      badgeVariant: 'secondary',
      badgeText: 'Cancelled',
      badgeColor: 'bg-gray-500',
      canJoin: false,
      message: 'This lecture has been cancelled',
      status: 'ended'
    };
  }

  const now = new Date();
  const startTime = new Date(lecture.start_time);
  const endTime = new Date(startTime.getTime() + lecture.duration_minutes * 60000);

  if (now < startTime) {
    const timeToStart = startTime.getTime() - now.getTime();
    const hoursToStart = Math.floor(timeToStart / (1000 * 60 * 60));
    const minutesToStart = Math.floor((timeToStart % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      badgeVariant: 'outline',
      badgeText: 'Upcoming',
      canJoin: false,
      message: `Starts in ${hoursToStart > 0 ? `${hoursToStart}h ` : ''}${minutesToStart}m`,
      status: 'upcoming'
    };
  } else if (now >= startTime && now <= endTime) {
    return {
      badgeVariant: 'default',
      badgeText: 'Live Now',
      badgeColor: 'bg-red-500',
      canJoin: true,
      message: 'Live lecture in progress',
      status: 'live'
    };
  } else {
    return {
      badgeVariant: 'secondary',
      badgeText: 'Ended',
      canJoin: false,
      message: 'Lecture has ended',
      status: 'ended'
    };
  }
};

export const formatLectureTime = (startTime: string, durationMinutes: number) => {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  
  return {
    date: start.toLocaleDateString(),
    startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    duration: `${durationMinutes} min`
  };
}; 