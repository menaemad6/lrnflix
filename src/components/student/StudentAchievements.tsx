
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <div className="flex items-center justify-between">
          <CardTitle className="gradient-text flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            {unlockedCount}/{totalCount} Unlocked
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`group relative p-4 rounded-xl border transition-all duration-300 ${
                achievement.earned
                  ? 'bg-gradient-to-br ' + getRarityGradient(achievement.rarity) + ' border-white/20 hover:border-white/30 hover:scale-[1.02]'
                  : 'bg-white/5 border-white/10 hover:border-white/20 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  achievement.earned
                    ? 'bg-gradient-to-br ' + getRarityGradient(achievement.rarity)
                    : 'bg-white/10'
                }`}>
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium text-sm ${achievement.earned ? 'text-white' : 'text-muted-foreground'}`}>
                      {achievement.title}
                    </h4>
                    <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <p className={`text-xs leading-relaxed ${achievement.earned ? 'text-gray-300' : 'text-muted-foreground'}`}>
                    {achievement.description}
                  </p>
                  {!achievement.earned && achievement.progress !== undefined && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{Math.round(achievement.progress)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {achievement.earned && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Trophy className="h-3 w-3 text-white" />
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
