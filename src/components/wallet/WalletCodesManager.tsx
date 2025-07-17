import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Copy, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WalletCode {
  id: string;
  code: string;
  amount: number;
  used_by: string | null;
  used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export const WalletCodesManager = () => {
  const { toast } = useToast();
  const [codes, setCodes] = useState<WalletCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState({
    amount: ''
  });

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('wallet_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCodes(data || []);
    } catch (error: any) {
      console.error('Error fetching codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wallet codes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCode.amount || parseInt(newCode.amount) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate the code using the database function
      const { data: generatedCode, error: codeError } = await supabase.rpc('generate_wallet_code');
      
      if (codeError) {
        console.error('Error generating code:', codeError);
        throw new Error('Failed to generate unique code');
      }

      if (!generatedCode) {
        throw new Error('No code generated');
      }

      const codeData = {
        code: generatedCode,
        amount: parseInt(newCode.amount),
        created_by: user.id
      };

      const { error } = await supabase
        .from('wallet_codes')
        .insert(codeData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Wallet code created successfully!',
      });

      setNewCode({
        amount: ''
      });
      setShowCreateForm(false);
      fetchCodes();
    } catch (error: any) {
      console.error('Error creating code:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create wallet code',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: 'Code copied to clipboard',
    });
  };

  const copyRedeemLink = (code: string) => {
    const link = `${window.location.origin}/redeem?code=${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link Copied!',
      description: 'Redemption link copied to clipboard',
    });
  };

  const deactivateCode = async (codeId: string) => {
    if (!confirm('Are you sure you want to deactivate this code?')) return;

    try {
      const { error } = await supabase
        .from('wallet_codes')
        .update({ is_active: false })
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Code deactivated successfully',
      });

      fetchCodes();
    } catch (error: any) {
      console.error('Error deactivating code:', error);
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
        <h3 className="text-lg font-semibold">Wallet Codes</h3>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Code
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Wallet Code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createCode} className="space-y-4">
              <div>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newCode.amount}
                  onChange={(e) => setNewCode({ amount: e.target.value })}
                  required
                  min="1"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Code'}
                </Button>
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyRedeemLink(code.code)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Badge variant={code.used_by ? 'secondary' : code.is_active ? 'default' : 'destructive'}>
                      {code.used_by ? 'Used' : code.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Amount: {code.amount} credits</p>
                    {code.used_at && (
                      <p>Used: {formatDistanceToNow(new Date(code.used_at), { addSuffix: true })}</p>
                    )}
                    {code.expires_at && (
                      <p>Expires: {new Date(code.expires_at).toLocaleDateString()}</p>
                    )}
                    <p>Created: {formatDistanceToNow(new Date(code.created_at), { addSuffix: true })}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!code.used_by && code.is_active && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deactivateCode(code.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {codes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No wallet codes created yet.</p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Code
          </Button>
        </div>
      )}
    </div>
  );
};
