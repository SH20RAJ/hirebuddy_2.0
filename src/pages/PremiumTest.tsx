import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePremiumUser } from "@/hooks/usePremiumUser";
import { premiumService } from "@/services/premiumService";
import { PremiumBadge, PremiumCard, PremiumHeader } from "@/components/ui/premium-badge";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Crown, User, Mail, Phone, Building, CreditCard } from "lucide-react";

export default function PremiumTest() {
  const { user } = useAuth();
  const { isPremium, premiumData, loading, error, refetch } = usePremiumUser();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddPremium = async () => {
    if (!user?.email) return;
    
    setIsAdding(true);
    try {
      await premiumService.addPremiumUser({
        email: user.email,
        name: user.user_metadata?.full_name || 'Test User',
        phone: '+1234567890',
        zoom_id: 'test-zoom-id',
        designation: 'Software Engineer',
        order_id: 'test-order-' + Date.now(),
        amount: 9900 // $99.00
      });
      await refetch();
    } catch (err) {
      console.error('Error adding premium user:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemovePremium = async () => {
    if (!premiumData?.id) return;
    
    setIsAdding(true);
    try {
      await premiumService.removePremiumUser(premiumData.id);
      await refetch();
    } catch (err) {
      console.error('Error removing premium user:', err);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading premium status...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Premium User Test Page</h1>
        <p className="text-gray-600">Test and demonstrate premium user functionality</p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current User Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Email:</span>
            <span className="font-medium">{user?.email || 'Not logged in'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Premium Status:</span>
            <div className="flex items-center gap-2">
              {isPremium ? (
                <>
                  <PremiumBadge variant="compact" />
                  <span className="text-green-600 font-medium">Premium Member</span>
                </>
              ) : (
                <span className="text-gray-600">Regular User</span>
              )}
            </div>
          </div>
          {error && (
            <div className="text-red-600 text-sm">Error: {error}</div>
          )}
        </CardContent>
      </Card>

      {/* Premium Data */}
      {isPremium && premiumData && (
        <PremiumCard>
          <PremiumHeader 
            title="Premium Member Details" 
            subtitle="Your premium account information"
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-medium">{premiumData.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium">{premiumData.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-medium">{premiumData.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="text-sm text-gray-600">Designation</div>
                  <div className="font-medium">{premiumData.designation}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="text-sm text-gray-600">Order ID</div>
                  <div className="font-medium">{premiumData.order_id}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Crown className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="text-sm text-gray-600">Amount Paid</div>
                  <div className="font-medium">${(premiumData.amount / 100).toFixed(2)}</div>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Member since: {new Date(premiumData.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </PremiumCard>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {!isPremium ? (
              <Button 
                onClick={handleAddPremium}
                disabled={isAdding || !user?.email}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
              >
                {isAdding ? 'Adding...' : 'Add Premium Status'}
              </Button>
            ) : (
              <Button 
                onClick={handleRemovePremium}
                disabled={isAdding}
                variant="destructive"
              >
                {isAdding ? 'Removing...' : 'Remove Premium Status'}
              </Button>
            )}
            <Button 
              onClick={() => refetch()}
              variant="outline"
            >
              Refresh Status
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            {!user?.email 
              ? 'Please log in to test premium functionality'
              : 'Use the buttons above to test adding/removing premium status'
            }
          </p>
        </CardContent>
      </Card>

      {/* Premium Features Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Premium Features Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PremiumBadge />
            <PremiumBadge variant="compact" />
            <PremiumBadge variant="icon-only" />
          </div>
          <div className="text-sm text-gray-600">
            These are the premium badge components that appear throughout the dashboard when a user has premium status.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 