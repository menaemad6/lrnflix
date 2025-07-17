
import React from 'react';
import { useParams } from 'react-router-dom';
import { DiscussionForum } from '@/components/discussions/DiscussionForum';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DiscussionsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();

  if (!courseId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Course not found</h2>
            <p className="text-muted-foreground">Please select a valid course to view discussions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Course Discussions</CardTitle>
        </CardHeader>
        <CardContent>
          <DiscussionForum courseId={courseId} />
        </CardContent>
      </Card>
    </div>
  );
};
