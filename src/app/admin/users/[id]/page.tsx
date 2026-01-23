'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Gem,
  CreditCard,
  Calendar,
  Mail,
  MapPin,
  Eye,
  Star,
  UserCog,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChangeRoleModal } from '@/components/admin/ChangeRoleModal';
import { AFRICAN_COUNTRIES, GEM_CATEGORIES } from '@/constants';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { UserRole, Gem as GemType, Payment, GemStatus, PaymentStatus } from '@/types';
import type { UserWithDetails } from '@/lib/api/admin';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);

  // Fetch user data
  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/admin/users');
          return;
        }
        throw new Error('Failed to fetch user');
      }
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Handle role change
  const handleRoleChange = async (newRole: UserRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update role');

      // Refresh user data
      fetchUser();
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  };

  // Get country info
  const getCountryInfo = (countryCode: string) => {
    const countryInfo = AFRICAN_COUNTRIES.find((c) => c.code === countryCode);
    return countryInfo || { flag: '', name: countryCode };
  };

  // Get initials from name
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // Role badge styling
  const getRoleBadgeClass = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'owner':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Status badge styling
  const getStatusBadgeVariant = (status: GemStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Payment status badge styling
  const getPaymentStatusBadgeVariant = (status: PaymentStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return <UserDetailSkeleton />;
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">User not found</h2>
          <p className="text-muted-foreground mb-4">
            The user you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Link href="/admin/users">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const countryInfo = user.country ? getCountryInfo(user.country) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/admin/users">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </Link>

      {/* User Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and basic info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold">{user.full_name || 'Unnamed User'}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                {countryInfo && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{countryInfo.flag} {countryInfo.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Stats and role management */}
            <div className="md:ml-auto flex flex-col items-start md:items-end gap-4">
              {/* Role Badge and Change Button */}
              <div className="flex items-center gap-3">
                <Badge className={getRoleBadgeClass(user.role)}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangeRoleModalOpen(true)}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Change Role
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{user.gems_count}</p>
                  <p className="text-sm text-muted-foreground">Gems</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{user.payments.length}</p>
                  <p className="text-sm text-muted-foreground">Payments</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Gems and Payments */}
      <Tabs defaultValue="gems" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gems" className="gap-2">
            <Gem className="h-4 w-4" />
            Gems ({user.gems.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payments ({user.payments.length})
          </TabsTrigger>
        </TabsList>

        {/* Gems Tab */}
        <TabsContent value="gems">
          <Card>
            <CardHeader>
              <CardTitle>User&apos;s Gems</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {user.gems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <Gem className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">No gems yet</h3>
                  <p className="text-muted-foreground">
                    This user hasn&apos;t created any gems.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gem Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Views</TableHead>
                      <TableHead className="text-center">Rating</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.gems.map((gem) => {
                      const categoryInfo = GEM_CATEGORIES[gem.category];
                      const gemCountryInfo = getCountryInfo(gem.country);
                      return (
                        <TableRow key={gem.id}>
                          <TableCell className="font-medium">{gem.name}</TableCell>
                          <TableCell>{categoryInfo?.label || gem.category}</TableCell>
                          <TableCell>
                            {gemCountryInfo.flag} {gem.city}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(gem.status)}>
                              {gem.status.charAt(0).toUpperCase() + gem.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              {gem.views_count}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              {gem.average_rating.toFixed(1)}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(gem.created_at)}
                          </TableCell>
                          <TableCell>
                            <Link href={`/admin/gems/${gem.id}`}>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {user.payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">No payments yet</h3>
                  <p className="text-muted-foreground">
                    This user hasn&apos;t made any payments.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gem</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Term Period</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.gem?.name || 'Unknown Gem'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {payment.type.replace('_', ' ').charAt(0).toUpperCase() +
                              payment.type.replace('_', ' ').slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(payment.amount, payment.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPaymentStatusBadgeVariant(payment.status)}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">
                          {payment.provider}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(payment.term_start)} - {formatDate(payment.term_end)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(payment.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Role Modal */}
      <ChangeRoleModal
        isOpen={isChangeRoleModalOpen}
        onClose={() => setIsChangeRoleModalOpen(false)}
        onConfirm={handleRoleChange}
        userName={user.full_name || 'User'}
        currentRole={user.role}
      />
    </div>
  );
}

// Loading skeleton component
function UserDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Skeleton className="h-9 w-[120px]" />

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[180px]" />
              </div>
            </div>
            <div className="md:ml-auto flex flex-col items-start md:items-end gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-[80px]" />
                <Skeleton className="h-9 w-[120px]" />
              </div>
              <div className="flex gap-6">
                <div className="text-center space-y-2">
                  <Skeleton className="h-8 w-8 mx-auto" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="text-center space-y-2">
                  <Skeleton className="h-8 w-8 mx-auto" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Skeleton className="h-10 w-[300px]" />
        <Card>
          <CardContent className="p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b last:border-0">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-6 w-[80px]" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
