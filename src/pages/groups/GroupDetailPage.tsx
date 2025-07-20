import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';

interface GroupDetails {
  id: string;
  name: string;
  description: string;
  group_code: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  max_members: number | null;
  is_public: boolean;
  is_code_visible: boolean;
  is_members_visible: boolean;
}

interface Member {
  id: string;
  user_id: string;
  group_id: string;
  joined_at: string;
  user: {
    id: string;
    email: string;
    user_metadata: {
      avatar_url: string;
      full_name: string;
    };
  };
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  group_id: string;
  user: {
    id: string;
    email: string;
    user_metadata: {
      avatar_url: string;
      full_name: string;
    };
  };
}

const GroupDetailPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) return;
      
      try {
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();

        if (error) throw error;
        
        // Set default values for missing properties
        const groupWithDefaults = {
          ...data,
          is_code_visible: data.is_code_visible ?? true,
          is_members_visible: data.is_members_visible ?? true
        };
        
        setGroupDetails(groupWithDefaults);
      } catch (error) {
        console.error('Error fetching group details:', error);
        toast.error('Failed to load group details');
      }
    };

    const fetchGroupMembers = async () => {
      if (!groupId) return;

      try {
        const { data, error } = await supabase
          .from('group_members')
          .select('*, user:user_id (id, email, user_metadata)')
          .eq('group_id', groupId);

        if (error) throw error;
        setMembers(data as Member[]);
      } catch (error) {
        console.error('Error fetching group members:', error);
        toast.error('Failed to load group members');
      }
    };

    const fetchGroupPosts = async () => {
      if (!groupId) return;

      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, user:user_id (id, email, user_metadata)')
          .eq('group_id', groupId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data as Post[]);
      } catch (error) {
        console.error('Error fetching group posts:', error);
        toast.error('Failed to load group posts');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
    fetchGroupMembers();
    fetchGroupPosts();
  }, [groupId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Loading group details...</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-3xl font-semibold mb-6">{groupDetails?.name}</h2>
        
        {/* Group Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Group Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Group Name</label>
                <p className="text-lg font-semibold">{groupDetails?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-700">{groupDetails?.description}</p>
              </div>
              {groupDetails?.is_code_visible && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Group Code</label>
                  <p className="text-lg font-mono bg-gray-100 px-2 py-1 rounded">{groupDetails?.group_code}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-gray-700">{groupDetails?.created_at ? new Date(groupDetails.created_at).toLocaleDateString() : 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Max Members</label>
                <p className="text-gray-700">{groupDetails?.max_members ?? 'Unlimited'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Visibility</label>
                <p className="text-gray-700">{groupDetails?.is_public ? 'Public' : 'Private'}</p>
              </div>
            </div>
          </Card>

          {/* Members List */}
          {groupDetails?.is_members_visible && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Members</h2>
              <ul>
                {members.map((member) => (
                  <li key={member.id} className="py-2 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <img
                        src={member.user.user_metadata.avatar_url}
                        alt={member.user.user_metadata.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{member.user.user_metadata.full_name}</p>
                        <p className="text-gray-500 text-sm">{member.user.email}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
        
        {/* Posts List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Posts</h2>
          {posts.map((post) => (
            <div key={post.id} className="py-4 border-b last:border-b-0">
              <div className="flex items-start space-x-3">
                <img
                  src={post.user.user_metadata.avatar_url}
                  alt={post.user.user_metadata.full_name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="font-medium">{post.user.user_metadata.full_name}</p>
                  <p className="text-gray-500 text-sm">{new Date(post.created_at).toLocaleString()}</p>
                  <p className="mt-1">{post.content}</p>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GroupDetailPage;
