import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Copy, Trash2, ExternalLink, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useWalletCodes } from '@/lib/queries';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

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

interface WalletCodesManagerProps {
  searchTerm?: string;
  onCreateCode?: () => void;
  showCreateForm?: boolean;
}

export const WalletCodesManager: React.FC<WalletCodesManagerProps> = ({ searchTerm = '', onCreateCode, showCreateForm: showCreateFormProp }) => {
  const { toast } = useToast();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: codes = [], isLoading: loading, refetch: fetchCodes } = useWalletCodes(user?.id || '');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState({
    amount: ''
  });
  const [usedByInfo, setUsedByInfo] = useState<Record<string, { name: string; avatar_url?: string; wallet?: number; loading: boolean }>>({});
  const [openCodeId, setOpenCodeId] = useState<string | null>(null);

  // Use controlled showCreateForm if provided
  const showForm = typeof showCreateFormProp === 'boolean' ? showCreateFormProp : showCreateForm;

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

  // Filter codes by searchTerm
  const filteredCodes = codes.filter((code) =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.amount.toString().includes(searchTerm)
  );

  if (loading) {
    return <div>Loading codes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Wallet Codes</h3>
        {onCreateCode ? (
          <Button onClick={onCreateCode}>
            <Plus className="h-4 w-4 mr-2" />
            Create Code
          </Button>
        ) : (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Code
          </Button>
        )}
      </div>

      {showForm && (
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
                <Button type="button" variant="outline" onClick={() => {
                  if (typeof showCreateFormProp === 'boolean' && onCreateCode) {
                    onCreateCode(); // parent should toggle
                  } else {
                    setShowCreateForm(false);
                  }
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Accordion type="multiple" className="w-full" onValueChange={val => {
        // val is an array of open ids (since type=multiple)
        if (Array.isArray(val) && val.length > 0) {
          const codeId = val[val.length - 1];
          const code = filteredCodes.find(c => c.id === codeId);
          if (code && code.used_by && !usedByInfo[code.id]) {
            setUsedByInfo(prev => ({ ...prev, [code.id]: { name: '', avatar_url: '', wallet: undefined, loading: true } }));
            Promise.all([
              supabase
                .from('profiles')
                .select('full_name, avatar_url, wallet')
                .eq('id', code.used_by)
                .single(),
              
            ]).then(([profileRes]) => {
              setUsedByInfo(prev => ({
                ...prev,
                [code.id]: {
                  name: profileRes.data?.full_name || 'Unknown',
                  avatar_url: profileRes.data?.avatar_url,
                  wallet: profileRes.data?.wallet,
                  loading: false
                }
              }));
            });
          }
          setOpenCodeId(codeId);
        } else {
          setOpenCodeId(null);
        }
      }}>
        {filteredCodes.map((code) => (
          <AccordionItem key={code.id} value={code.id}>
            <AccordionTrigger className="flex flex-wrap items-center gap-1 md:gap-2 px-4 py-3 bg-muted/50 rounded hover:bg-muted transition">
              <code className="bg-muted px-2 py-1 rounded font-mono text-lg">{code.code}</code>
              {/* Status badge: green for active, red for used, gray for inactive on small screens */}
              <Badge
                className="hidden md:inline-flex"
                variant={code.used_by ? 'destructive' : code.is_active ? 'default' : 'destructive'}
              >
                {code.used_by ? 'Used' : code.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {/* Mobile: correct/wrong coloring and icon only */}
              {code.is_active && !code.used_by && (
                <Badge className="inline-flex md:hidden bg-emerald-500 text-white p-1" variant="default">
                  <Check className="h-4 w-4" />
                </Badge>
              )}
              {code.used_by && (
                <Badge className="inline-flex md:hidden bg-destructive text-white p-1" variant="destructive">
                  <X className="h-4 w-4" />
                </Badge>
              )}
              {!code.is_active && !code.used_by && (
                <Badge className="inline-flex md:hidden bg-muted-foreground text-white p-1" variant="secondary">
                  <span className="w-4 h-4 block" />
                </Badge>
              )}
              {/* Value badge */}
              <Badge className="ml-auto text-xs px-2 py-1 font-semibold" variant="outline">
                <span className="inline md:hidden">{code.amount}</span>
                <span className="hidden md:inline">{code.amount} credits</span>
              </Badge>
              <div className="flex gap-1 md:gap-2 ml-2 md:ml-4">
                {/* Only show redeem on small screens, all on md+ */}
                <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); copyToClipboard(code.code); }} className="hidden md:inline-flex">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); copyRedeemLink(code.code); }} className="hidden md:inline-flex">
                  <ExternalLink className="h-4 w-4" />
                </Button>
                {!code.used_by && code.is_active && (
                  <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); deactivateCode(code.id); }} className="hidden md:inline-flex">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-background px-6 pb-4 pt-2 rounded-b">
              <div className="flex flex-col gap-2">
                {/* Show all buttons stacked on small screens in content */}
                <div className="flex flex-col xs:flex-row gap-2 items-stretch md:hidden mb-2">
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(code.code)}>
                    <Copy className="h-4 w-4 mr-2" />Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => copyRedeemLink(code.code)}>
                    <ExternalLink className="h-4 w-4 mr-2" />Redeem
                  </Button>
                  {!code.used_by && code.is_active && (
                    <Button size="sm" variant="outline" onClick={() => deactivateCode(code.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />Deactivate
                    </Button>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-1 mt-2">
                  <p>Amount: <span className="font-semibold text-foreground">{code.amount} credits</span></p>
                  {code.used_at && <p>Used: {formatDistanceToNow(new Date(code.used_at), { addSuffix: true })}</p>}
                  {code.expires_at && <p>Expires: {new Date(code.expires_at).toLocaleDateString()}</p>}
                  <p>Created: {formatDistanceToNow(new Date(code.created_at), { addSuffix: true })}</p>
                  {/* Used by info */}
                  {code.used_by && (
                    <div className="flex items-center gap-2 mt-2">
                      {usedByInfo[code.id]?.loading ? (
                        <span>Loading user...</span>
                      ) : usedByInfo[code.id] ? (
                        <>
                          <Avatar className="h-8 w-8">
                            {usedByInfo[code.id].avatar_url ? (
                              <AvatarImage src={usedByInfo[code.id].avatar_url} alt={usedByInfo[code.id].name} />
                            ) : null}
                            <AvatarFallback>
                              {usedByInfo[code.id].name?.charAt(0).toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-foreground">{usedByInfo[code.id].name}</span>
                          {typeof usedByInfo[code.id].wallet === 'number' && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              Wallet: {usedByInfo[code.id].wallet}
                              {code.used_at && (
                                <span className="ml-2">|
                                  <span className="ml-1">{new Date(code.used_at).toLocaleString()}</span>
                                </span>
                              )}
                            </span>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {filteredCodes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No wallet codes created yet.</p>
          <Button onClick={onCreateCode ? onCreateCode : () => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Code
          </Button>
        </div>
      )}
    </div>
  );
};
