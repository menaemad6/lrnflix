
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, Target, BookOpen, Clock, Award, Crown } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  progress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
}

interface StudentAchievementsProps {
  stats: {
    totalCourses: number;
    completedCourses: number;
    totalCreditsSpent: number;
    avgQuizScore?: number;
    studyStreak?: number;
  };
}

export const StudentAchievements = ({ stats }: StudentAchievementsProps) => {
  const achievements: Achievement[] = [
    {
      id: 'first_course',
      title: 'First Steps',
      description: 'Complete your first course',
      icon: <BookOpen className="h-4 w-4" />,
      earned: stats.completedCourses > 0,
      rarity: 'common',
      category: 'Learning'
    },
    {
      id: 'course_collector',
      title: 'Course Collector',
      description: 'Enroll in 5 different courses',
      icon: <Target className="h-4 w-4" />,
      earned: stats.totalCourses >= 5,
      progress: Math.min((stats.totalCourses / 5) * 100, 100),
      rarity: 'rare',
      category: 'Exploration'
    },
    {
      id: 'quiz_master',
      title: 'Quiz Master',
      description: 'Achieve 90%+ average quiz score',
      icon: <Star className="h-4 w-4" />,
      earned: (stats.avgQuizScore || 0) >= 0.9,
      progress: Math.min(((stats.avgQuizScore || 0) / 0.9) * 100, 100),
      rarity: 'epic',
      category: 'Excellence'
    },
    {
      id: 'big_spender',
      title: 'Investor',
      description: 'Spend 500+ credits on learning',
      icon: <Zap className="h-4 w-4" />,
      earned: stats.totalCreditsSpent >= 500,
      progress: Math.min((stats.totalCreditsSpent / 500) * 100, 100),
      rarity: 'rare',
      category: 'Investment'
    },
    {
      id: 'streak_champion',
      title: 'Streak Champion',
      description: 'Maintain a 30-day learning streak',
      icon: <Trophy className="h-4 w-4" />,
      earned: (stats.studyStreak || 0) >= 30,
      progress: Math.min(((stats.studyStreak || 0) / 30) * 100, 100),
      rarity: 'legendary',
      category: 'Consistency'
    },
    {
      id: 'graduate',
      title: 'Graduate',
      description: 'Complete 10 courses',
      icon: <Crown className="h-4 w-4" />,
      earned: stats.completedCourses >= 10,
      progress: Math.min((stats.completedCourses / 10) * 100, 100),
      rarity: 'legendary',
      category: 'Mastery'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'rare': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'epic': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'legendary': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-500/20 to-gray-600/20';
      case 'rare': return 'from-blue-500/20 to-cyan-500/20';
      case 'epic': return 'from-purple-500/20 to-pink-500/20';
      case 'legendary': return 'from-yellow-500/20 to-orange-500/20';
      default: return 'from-gray-500/20 to-gray-600/20';
    }
  };

  const earnedAchievements = achievements.filter(a => a.earned);
  const unlockedCount = earnedAchievements.length;
  const totalCount = achievements.length;

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center">
            <Award className="h-6 w-6 text-black" />
          </div>
          <div>
            <div className="gradient-text text-xl font-bold">Achievements</div>
            <CardDescription className="text-muted-foreground/80">Unlock badges as you learn</CardDescription>
          </div>
          <div className="ml-auto">
            <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
              {unlockedCount}/{totalCount} Unlocked
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`group relative p-4 rounded-xl border transition-all duration-300 min-w-0 ${
                achievement.earned
                  ? 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 hover:border-primary/30 hover:scale-[1.02]'
                  : 'bg-background border-border hover:border-muted opacity-60'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  achievement.earned
                    ? 'bg-gradient-to-br from-primary/20 to-secondary/20'
                    : 'bg-muted'
                }`}>
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 min-w-0">
                    <h4 className={`font-medium text-sm truncate ${achievement.earned ? 'text-foreground' : 'text-muted-foreground'}`}>{achievement.title}</h4>
                    <Badge variant="secondary" className="capitalize truncate">
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <p className={`text-xs leading-relaxed break-words ${achievement.earned ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{achievement.description}</p>
                  {!achievement.earned && achievement.progress !== undefined && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{Math.round(achievement.progress)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {achievement.earned && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Trophy className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
