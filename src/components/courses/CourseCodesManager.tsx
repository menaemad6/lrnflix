
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Copy, Trash2 } from 'lucide-react';

interface CourseCode {
  id: string;
  code: string;
  discount_percentage: number | null;
  discount_amount: number | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface CourseCodesManagerProps {
  courseId: string;
}

export const CourseCodesManager = ({ courseId }: CourseCodesManagerProps) => {
  const { toast } = useToast();
  const [codes, setCodes] = useState<CourseCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCode, setNewCode] = useState({
    code: '',
    discount_percentage: '',
    discount_amount: '',
    max_uses: '',
    expires_at: ''
  });

  useEffect(() => {
    fetchCodes();
  }, [courseId]);

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('course_codes')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCodes(data || []);
    } catch (error: any) {
      console.error('Error fetching codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course codes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode({ ...newCode, code: result });
  };

  const createCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const codeData = {
        course_id: courseId,
        code: newCode.code,
        discount_percentage: newCode.discount_percentage ? parseInt(newCode.discount_percentage) : null,
        discount_amount: newCode.discount_amount ? parseFloat(newCode.discount_amount) : null,
        max_uses: newCode.max_uses ? parseInt(newCode.max_uses) : null,
        expires_at: newCode.expires_at || null,
        created_by: user.id
      };

      const { error } = await supabase
        .from('course_codes')
        .insert(codeData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Course code created successfully!',
      });

      setNewCode({
        code: '',
        discount_percentage: '',
        discount_amount: '',
        max_uses: '',
        expires_at: ''
      });
      setShowCreateForm(false);
      fetchCodes();
    } catch (error: any) {
      console.error('Error creating code:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: 'Code copied to clipboard',
    });
  };

  const toggleCodeStatus = async (codeId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('course_codes')
        .update({ is_active: !isActive })
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Code ${!isActive ? 'activated' : 'deactivated'}`,
      });

      fetchCodes();
    } catch (error: any) {
      console.error('Error updating code:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteCode = async (codeId: string) => {
    if (!confirm('Are you sure you want to delete this code?')) return;

    try {
      const { error } = await supabase
        .from('course_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Code deleted successfully',
      });

      fetchCodes();
    } catch (error: any) {
      console.error('Error deleting code:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading codes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Course Codes & Discounts</h3>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Code
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Course Code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createCode} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter code or generate"
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                  required
                  className="flex-1"
                />
                <Button type="button" onClick={generateRandomCode}>
                  Generate
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="number"
                    placeholder="Discount % (optional)"
                    value={newCode.discount_percentage}
                    onChange={(e) => setNewCode({ ...newCode, discount_percentage: e.target.value })}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Discount amount (optional)"
                    value={newCode.discount_amount}
                    onChange={(e) => setNewCode({ ...newCode, discount_amount: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="number"
                    placeholder="Max uses (optional)"
                    value={newCode.max_uses}
                    onChange={(e) => setNewCode({ ...newCode, max_uses: e.target.value })}
                    min="1"
                  />
                </div>
                <div>
                  <Input
                    type="datetime-local"
                    placeholder="Expires at (optional)"
                    value={newCode.expires_at}
                    onChange={(e) => setNewCode({ ...newCode, expires_at: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Code</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {codes.map((code) => (
          <Card key={code.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded font-mono text-lg">
                      {code.code}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(code.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Badge variant={code.is_active ? 'default' : 'secondary'}>
                      {code.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    {code.discount_percentage && (
                      <p>Discount: {code.discount_percentage}% off</p>
                    )}
                    {code.discount_amount && (
                      <p>Discount: ${code.discount_amount} off</p>
                    )}
                    {code.max_uses && (
                      <p>Uses: {code.current_uses}/{code.max_uses}</p>
                    )}
                    {code.expires_at && (
                      <p>Expires: {new Date(code.expires_at).toLocaleDateString()}</p>
                    )}
                    <p>Created: {new Date(code.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleCodeStatus(code.id, code.is_active)}
                  >
                    {code.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteCode(code.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {codes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No course codes created yet.</p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Code
          </Button>
        </div>
      )}
    </div>
  );
};
