
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search, Calendar, BookOpen, ImageDown } from 'lucide-react';
import { toast } from 'sonner';
import { useRandomBackground } from '@/hooks/useRandomBackground';
import WavesHeroHeader from '@/components/ui/WavesHeroHeader';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { TeacherCardSkeleton } from '@/components/student/skeletons/TeacherCardSkeleton';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo';

interface Teacher {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  specialization: string | null;
  experience_years: number | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  course_count?: number;
}

// TeachersFilterBar reusable component
interface TeachersFilterBarProps {
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  selectedSpecialization: string;
  onSpecializationChange: (v: string) => void;
  specializations: string[];
}
const TeachersFilterBar: React.FC<TeachersFilterBarProps> = ({
  searchTerm,
  onSearchTermChange,
  selectedSpecialization,
  onSpecializationChange,
  specializations,
}) => {
  const [searchFocused, setSearchFocused] = React.useState(false);
  const { t } = useTranslation('dashboard');

  return (
    <div className="w-full mb-12">
      <div className="glass-card flex flex-row items-center gap-4 p-4 shadow-lg border border-primary/10 bg-background/90 w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={t('teachersPage.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-12 py-3 rounded-xl bg-background/80 border border-primary/20 focus:ring-2 focus:ring-primary/30"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
        {/* Hide filter on small screens when search is focused */}
        <div className={`transition-all duration-200 ${searchFocused ? 'hidden sm:block' : ''} w-full sm:w-56`}>
          <Select value={selectedSpecialization} onValueChange={onSpecializationChange}>
            <SelectTrigger className="w-full rounded-xl border border-primary/20 bg-background/80 focus:ring-2 focus:ring-primary/30">
              <SelectValue>{selectedSpecialization === 'All' ? t('teachersPage.allSpecializations') : selectedSpecialization}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {specializations.map(spec => (
                <SelectItem key={spec} value={spec}>
                  {spec === 'All' ? t('teachersPage.allSpecializations') : spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export const TeachersPage = () => {
  const { t } = useTranslation('dashboard');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const bgClass = useRandomBackground();

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    filterTeachers();
  }, [searchTerm, teachers, selectedSpecialization]);

  const fetchTeachers = async () => {
    try {
      // First, get all active teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (teachersError) {
        toast.error(t('teachersPage.errorLoading'));
        return;
      }

      // Then, for each teacher, count their courses
      const teachersWithCourseCount = await Promise.all(
        (teachersData || []).map(async (teacher) => {
          const { count } = await supabase
            .from('courses')
            .select('*', { count: 'exact', head: true })
            .eq('instructor_id', teacher.user_id)
            .eq('status', 'published');

          return {
            ...teacher,
            course_count: count || 0
          };
        })
      );

      setTeachers(teachersWithCourseCount);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error(t('teachersPage.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const filterTeachers = () => {
    let filtered = teachers;
    if (searchTerm.trim()) {
      filtered = filtered.filter(teacher =>
        teacher.display_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedSpecialization !== 'All') {
      filtered = filtered.filter(teacher =>
        teacher.specialization === selectedSpecialization
      );
    }
    setFilteredTeachers(filtered);
  };

  const specializations = React.useMemo(() => {
    const specs = teachers
      .map(t => t.specialization)
      .filter(Boolean);
    return ['All', ...Array.from(new Set(specs))];
  }, [teachers]);

  return (
    <>
      <SEOHead />
      <div className={`min-h-screen ${bgClass}`}>
        {/* Full-width header */}
        <WavesHeroHeader
        title={<>
          {t('teachersPage.meet_our_expert_teachers')} <span className="text-primary-500 dark:text-primary-400">{t('teachersPage.expert_teachers')}</span>
        </>}
        description={t('teachersPage.discover_passionate_educators_description')}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="-mt-12">
          <TeachersFilterBar
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            selectedSpecialization={selectedSpecialization}
            onSpecializationChange={setSelectedSpecialization}
            specializations={specializations}
          />
        </div>
        {/* Teachers Grid or Skeletons */}
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <TeacherCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              {searchTerm ? t('teachersPage.no_teachers_matching_search') : t('teachersPage.no_teachers_available')}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <Link key={teacher.id} to={`/teachers/${teacher.slug}`} className="group">
                <Card className="h-full rounded-3xl border-0 glass-card shadow-xl bg-background/80 group-hover:scale-[1.03] group-hover:shadow-2xl transition-all duration-200 overflow-hidden">
                  <CardContent className="p-0">
                    {/* Cover Image */}
                    <div className="relative h-32 sm:h-36 bg-gradient-to-r from-primary to-primary-400">
                      {teacher.cover_image_url ? (
                        <img
                          src={teacher.cover_image_url}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/40 bg-muted">
                          <ImageDown className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/10" />
                    </div>
                    {/* Profile Info */}
                    <div className="flex flex-col items-center -mt-10 px-6">
                      <Avatar className="w-20 h-20 border-4 border-background shadow-lg bg-white">
                        <AvatarImage src={teacher.profile_image_url || undefined} />
                        <AvatarFallback className="text-2xl">
                          {teacher.display_name ? teacher.display_name.charAt(0).toUpperCase() : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-lg text-foreground mt-3 mb-1 truncate w-full text-center">
                        {teacher.display_name || t('teachersPage.unnamed_teacher')}
                      </h3>
                      {teacher.specialization && (
                        <Badge variant="secondary" className="mb-2 text-xs bg-primary/10 text-primary border-primary/20">
                          {teacher.specialization}
                        </Badge>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        {teacher.experience_years && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {t('teachersPage.years_experience', { years: teacher.experience_years })}
                          </div>
                        )}

                      </div>
                    </div>
                    {/* Bio */}
                    {teacher.bio && (
                      <p className="text-muted-foreground text-sm mt-3 px-6 pb-6 line-clamp-2 text-center">
                        {teacher.bio}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        </div>
      </div>
    </>
  );
};
