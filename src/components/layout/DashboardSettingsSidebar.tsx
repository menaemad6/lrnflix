
import React, { useState, useEffect } from "react";
import { MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "../ui/button";
import { useTranslation } from 'react-i18next';

interface DashboardSettingsSidebarProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

export const DashboardSettingsSidebar: React.FC<DashboardSettingsSidebarProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation('navigation');
  const { user } = useSelector((state: RootState) => state.auth);
  const [teacherSlug, setTeacherSlug] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);

  // Check if user is a teacher and fetch their slug
  useEffect(() => {
    const checkTeacherStatus = async () => {
      if (user?.role === 'teacher') {
        setIsTeacher(true);
        try {
          const { data: teacherData, error } = await supabase
            .from('teachers')
            .select('slug, display_name')
            .eq('user_id', user.id)
            .single();
          
          if (!error && teacherData) {
            setTeacherSlug(teacherData.slug);
          } else if (error && error.code === 'PGRST116') {
            // Teacher profile doesn't exist yet - this is normal for new teachers
            console.log('Teacher profile not found - may need to be created');
          } else {
            console.error('Error fetching teacher slug:', error);
          }
        } catch (error) {
          console.error('Error fetching teacher slug:', error);
        }
      }
    };

    checkTeacherStatus();
  }, [user]);

  return (
    <aside className="w-full lg:w-64 lg:min-w-[220px] h-fit bg-card border border-border rounded-2xl shadow-xl p-4 mt-2 lg:sticky lg:top-24">
      <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
        <Button
          onClick={() => onTabChange?.("announcements")}
          variant={activeTab === "announcements" ? "default" : "outline"}
        >
          <MessageSquare className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
          <span className="hidden sm:inline">{t('sidebar.announcements')}</span>
        </Button>

        {/* Teacher Profile Link - Only show for teachers */}
        {isTeacher && (
          <>
            {teacherSlug ? (
            <Button
            variant={"outline"}>
               <Link
                  to={`/teachers/${teacherSlug}`}
                  className="w-full flex items-center justify-center gap-2"
                  >
                  <User className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                  <span className="hidden sm:inline">{t('sidebar.myProfile')}</span>
                </Link>
            </Button>
              
            ) : (
              <div className="px-3 py-3 rounded-xl text-sm lg:text-base text-muted-foreground bg-muted/50">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                  <span className="hidden sm:inline">{t('sidebar.profileSetupRequired')}</span>
                </div>
                <p className="text-xs mt-1 text-muted-foreground">
                  {t('sidebar.contactAdminForProfile')}
                </p>
              </div>
            )}
          </>
        )}
      </nav>
    </aside>
  );
};
