import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trash2, Shield, ShieldOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SuperAdmin = () => {
  const { isSuperAdmin, loading } = useAuth();
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const queryClient = useQueryClient();

  const { data: allUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*, user_roles(role)');
      
      if (error) throw error;
      return profiles;
    },
  });

  const promoteToAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast.success('User promoted to admin');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to promote user');
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      toast.success('Admin privileges removed');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove admin');
    },
  });

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  const getUserRoles = (userRoles: any[]) => {
    return userRoles?.map(ur => ur.role) || [];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Super Admin Dashboard</h1>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Manage Administrators</CardTitle>
              <CardDescription>
                Promote users to admin or remove admin privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allUsers?.map((user) => {
                  const roles = getUserRoles(user.user_roles);
                  const isAdmin = roles.includes('admin');
                  const isSuperAdmin = roles.includes('super_admin');

                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{user.full_name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex gap-2 mt-2">
                          {roles.map((role) => (
                            <Badge key={role} variant={role === 'super_admin' ? 'default' : 'secondary'}>
                              {role.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!isSuperAdmin && (
                          <>
                            {!isAdmin ? (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => promoteToAdminMutation.mutate(user.id)}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeAdminMutation.mutate(user.id)}
                              >
                                <ShieldOff className="h-4 w-4 mr-2" />
                                Remove Admin
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{allUsers?.length || 0}</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold">
                    {allUsers?.filter(u => getUserRoles(u.user_roles).includes('admin')).length || 0}
                  </p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">Super Admins</p>
                  <p className="text-2xl font-bold">
                    {allUsers?.filter(u => getUserRoles(u.user_roles).includes('super_admin')).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SuperAdmin;
