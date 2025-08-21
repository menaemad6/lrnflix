import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { JoinGroupModal } from '@/components/groups/JoinGroupModal';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, MessageCircle, Calendar, Hash, Search, UserMinus, Share2 } from 'lucide-react';
import { useRandomBackground } from "../../hooks/useRandomBackground";
import { useTenant } from '@/contexts/TenantContext';
import DashboardModernHeader from '@/components/ui/DashboardModernHeader';
import { GroupCardSkeleton } from '@/components/student/skeletons/GroupCardSkeleton';
import { useStudentGroups } from '@/lib/queries';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useTranslation } from 'react-i18next';

interface Group {
  id: string;
  name: string;
  description: string | null;
  group_code: string;
  created_at: string;
  member_count: number;
  is_public: boolean;
  max_members: number | null;
  thumbnail_url?: string;
}

export const StudentGroups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const { teacher } = useTenant();
  const { data, isLoading, error, refetch } = useStudentGroups(user, teacher);
  const { groups = [], memberGroupIds = [] } = data || {};
  const { t } = useTranslation('dashboard');

  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const bgClass = useRandomBackground();

  useEffect(() => {
    if (groups) {
        if (searchTerm.trim() === '') {
            setFilteredGroups(groups);
        } else {
            const filtered = groups.filter(group =>
                group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.group_code.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredGroups(filtered);
        }
    }
  }, [searchTerm, groups]);
  
  useEffect(() => {
    if (error) {
        toast({
            title: t('studentGroups.errorFetchingGroups'),
            description: error.message,
            variant: 'destructive',
        });
    }
  }, [error, toast]);

  const handleLeaveGroup = async (groupId: string, groupName: string) => {
    if (!confirm(t('studentGroups.confirmLeaveGroup', { groupName }))) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('student_id', user.id);

      if (error) throw error;

      toast({
        title: t('studentGroups.success'),
        description: t('studentGroups.leftGroup', { groupName }),
      });

      refetch();
    } catch (error: unknown) {
      console.error('Error leaving group:', error instanceof Error ? error.message : error);
      toast({
        title: t('studentGroups.error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    }
  };

  const shareGroup = (group: Group) => {
    const shareLink = `${window.location.origin}/groups/${group.id}`;
    if (navigator.share) {
      navigator.share({
        title: `Join ${group.name}`,
        text: `Join our study group: ${group.name}`,
        url: shareLink,
      });
    } else {
      navigator.clipboard.writeText(shareLink);
      toast({
        title: 'Link copied!',
        description: 'Group invitation link copied to clipboard',
      });
    }
  };



  return (
    <div className={bgClass + " min-h-screen"}>
      <DashboardLayout>

          <DashboardModernHeader
            title={t('studentGroups.title')}
            subtitle={t('studentGroups.subtitle')}
            buttonText={t('studentGroups.joinGroup')}
            onButtonClick={() => setShowJoinModal(true)}
          />

          {/* Search Bar */}
          <Card className="glass-card w-full max-w-full">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-row gap-4 w-full items-center">
                <div className="flex-1 min-w-0 w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t('studentGroups.searchGroups')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 glass"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Groups Grid or Skeletons */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
              {[...Array(6)].map((_, i) => (
                <GroupCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm ? t('studentGroups.noGroupsFound') : t('studentGroups.noGroupsYet')}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm 
                    ? t('studentGroups.tryAdjustingSearch')
                    : t('studentGroups.joinFirstGroup')
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowJoinModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('studentGroups.joinYourFirstGroup')}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => {
                const isPublic = group.is_public;
                const borderColor = isPublic ? 'border-l-8 border-primary-500' : 'border-l-8 border-yellow-400';
                const badgeColor = isPublic ? 'bg-primary-500 text-white' : 'bg-yellow-400 text-yellow-900 font-bold rounded-full shadow px-3 py-1 border border-yellow-300 hover:bg-yellow-300 hover:border-yellow-500 transition-colors';
                const badgeLabel = isPublic ? t('studentGroups.public') : t('studentGroups.private');
                return (
                  <Card
                    key={group.id}
                    className={`glass-card ${borderColor} rounded-2xl shadow-lg hover:shadow-primary-500/30 hover:scale-[1.02] transition-all duration-200 group-card w-full`}
                  >
                    {/* Group Thumbnail */}
                    <div className="w-full h-48 overflow-hidden rounded-t-2xl">
                      {group.thumbnail_url ? (
                        <img
                          src={group.thumbnail_url}
                          alt={group.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/10 to-muted/20 flex items-center justify-center">
                          <Users className="w-16 h-16 text-primary/60" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl font-extrabold gradient-text mb-1 break-words whitespace-normal">
                            {group.name}
                          </CardTitle>
                          {group.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-3 break-words whitespace-normal">{group.description}</p>
                          )}
                        </div>
                        <Badge className={`ml-2 flex-shrink-0 px-3 py-1 rounded-full text-base font-bold ${badgeColor} shadow-md`}>
                          <Users className="w-4 h-4 mr-1" />
                          {group.member_count} {t('studentGroups.members')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          
                          <Badge className={`px-2 py-1 rounded-lg text-xs font-semibold ${badgeColor}`}>{badgeLabel}</Badge>
                          {group.max_members && (
                            <span className="text-xs text-muted-foreground ml-2">{t('studentGroups.maxMembers')}: {group.max_members}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 sm:mt-0">
                          <Calendar className="w-4 h-4" />
                          <span>{t('studentGroups.joined')} {new Date(group.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button 
                          onClick={() => navigate(`/groups/${group.id}`)}
                          className="rounded-xl font-semibold flex-1 min-w-[100px]"
                          size="sm"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {t('studentGroups.open')}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => shareGroup(group)}
                          title={t('studentGroups.shareGroup')}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        
                        {/* Leave button: only show if student is a member of the group */}
                        {memberGroupIds.includes(group.id) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="rounded-xl text-destructive hover:text-destructive"
                            onClick={() => handleLeaveGroup(group.id, group.name)}
                            title={t('studentGroups.leaveGroup')}
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {searchTerm && filteredGroups.length > 0 && (
            <div className="text-center">
              <p className="text-muted-foreground">
                {t('studentGroups.foundGroups', { count: filteredGroups.length, searchTerm })}
              </p>
            </div>
          )}

          <JoinGroupModal
            isOpen={showJoinModal}
            onClose={() => setShowJoinModal(false)}
            onGroupJoined={refetch}
          />
      </DashboardLayout>
    </div>
  );
};
