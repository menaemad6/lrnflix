
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  const [groupCode, setGroupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'search'>('code');

  const handleJoinByCode = async () => {
    if (!groupCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a group code',
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
          title: 'Success',
          description: `Joined group: ${result.group_name}`,
        });
        onGroupJoined();
        onClose();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to join group',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error joining group:', error);
      toast({
        title: 'Error',
        description: error.message,
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
            <Users className="h-5 w-5" />
            Join a Group
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
              Group Code
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
              Group Link
            </button>
          </div>

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="groupCode" className="text-sm font-medium">
                  Enter Group Code
                </Label>
                <Input
                  id="groupCode"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC12345"
                  className="glass border-white/20 focus:border-primary/50 mt-2"
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ask your teacher for the 8-character group code
                </p>
              </div>

              <Button 
                onClick={handleJoinByCode}
                disabled={loading || !groupCode.trim()}
                className="w-full hover-glow"
              >
                {loading ? 'Joining...' : 'Join Group'}
              </Button>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Copy and paste a group invitation link here, or ask your teacher to send you one.
              </p>
              <div className="mt-4 p-4 glass rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Group links look like:<br />
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
