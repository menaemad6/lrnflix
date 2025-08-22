
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Users, Hash, Link as LinkIcon } from 'lucide-react';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupJoined: () => void;
}

interface JoinGroupResponse {
  success: boolean;
  group_id?: string;
  group_name?: string;
  error?: string;
}

export const JoinGroupModal = ({ isOpen, onClose, onGroupJoined }: JoinGroupModalProps) => {
  const { t } = useTranslation('dashboard');
  const { toast } = useToast();
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'search'>('code');

  const handleJoinByCode = async () => {
    if (!groupCode.trim()) {
      toast({
        title: t('joinGroupModal.error'),
        description: t('joinGroupModal.pleaseEnterGroupCode'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('join_group_by_code', {
        p_group_code: groupCode.trim().toUpperCase()
      });

      if (error) throw error;

      const result = data as unknown as JoinGroupResponse;

      if (result.success) {
        toast({
          title: t('joinGroupModal.success'),
          description: t('joinGroupModal.joinedGroupSuccessfully', { groupName: result.group_name }),
        });
        onGroupJoined();
        onClose();
      } else {
        toast({
          title: t('joinGroupModal.error'),
          description: result.error || t('joinGroupModal.failedToJoinGroup'),
          variant: 'destructive',
        });
      }
    } catch (error: unknown) {
      console.error('Error joining group:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: t('joinGroupModal.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGroupCode('');
    setActiveTab('code');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold gradient-text flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {t('joinGroupModal.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 glass p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-2 px-3 rounded-md transition-all ${
                activeTab === 'code' 
                  ? 'bg-primary/20 text-primary' 
                  : 'hover:bg-white/10'
              }`}
            >
              <Hash className="h-4 w-4 inline mr-2" />
              {t('joinGroupModal.groupCode')}
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-2 px-3 rounded-md transition-all ${
                activeTab === 'search' 
                  ? 'bg-primary/20 text-primary' 
                  : 'hover:bg-white/10'
              }`}
            >
              <LinkIcon className="h-4 w-4 inline mr-2" />
              {t('joinGroupModal.groupLink')}
            </button>
          </div>

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="groupCode" className="text-sm font-medium">
                  {t('joinGroupModal.enterGroupCode')}
                </Label>
                <Input
                  id="groupCode"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                  placeholder={t('joinGroupModal.groupCodePlaceholder')}
                  className="glass border-white/20 focus:border-primary/50 mt-2"
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('joinGroupModal.askTeacherForCode')}
                </p>
              </div>

              <Button 
                onClick={handleJoinByCode}
                disabled={loading || !groupCode.trim()}
                className="w-full hover-glow"
              >
                {loading ? t('joinGroupModal.joining') : t('joinGroupModal.joinGroup')}
              </Button>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {t('joinGroupModal.copyPasteLink')}
              </p>
              <div className="mt-4 p-4 glass rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {t('joinGroupModal.groupLinksLookLike')}<br />
                  <code className="text-primary">
                    /groups/abc123?code=GROUP123
                  </code>
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
