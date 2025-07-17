import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { GroupManager } from '@/components/groups/GroupManager';
import { GroupChat } from '@/components/groups/GroupChat';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import type { RootState } from '@/store/store';

export const GroupsPage = () => {
  const { courseId, groupId } = useParams<{ courseId?: string; groupId?: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groupId || null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'teacher') {
      navigate('/teacher/groups', { replace: true });
    } else {
      navigate('/student/groups', { replace: true });
    }
  }, [user, navigate]);

  // If we have a groupId in the URL, show the chat directly
  if (groupId) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <GroupChat 
            groupId={groupId} 
            onBack={() => setSelectedGroupId(null)} 
          />
        </div>
      </DashboardLayout>
    );
  }

  // If we have a selected group, show the chat
  if (selectedGroupId) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <GroupChat 
            groupId={selectedGroupId} 
            onBack={() => setSelectedGroupId(null)} 
          />
        </div>
      </DashboardLayout>
    );
  }

  // For teachers accessing without courseId, or students, show the group manager
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <GroupManager 
          courseId={courseId} 
          onGroupSelect={setSelectedGroupId}
        />
      </div>
    </DashboardLayout>
  );
};
