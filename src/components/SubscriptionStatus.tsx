import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, AlertTriangle, TrendingUp } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

interface SubscriptionStatusProps {
  clinicId: string;
  onUpgrade?: () => void;
}

export function SubscriptionStatus({ clinicId, onUpgrade }: SubscriptionStatusProps) {
  const { 
    usage, 
    currentPlan, 
    loading, 
    formatPrice, 
    getUsagePercentage, 
    isOverLimit,
    refreshUsage 
  } = useSubscription(clinicId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/3"></div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const usagePercentage = getUsagePercentage();
  const overLimit = isOverLimit();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Current Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Crown className="w-5 h-5 text-primary" />
              <span>Current Plan</span>
            </CardTitle>
            {currentPlan && (
              <Badge variant={currentPlan.tier === 'starter' ? 'secondary' : 'default'}>
                {currentPlan.name}
              </Badge>
            )}
          </div>
          <CardDescription>
            {currentPlan ? (
              <>
                {formatPrice(currentPlan.monthly_price)}/month
                {currentPlan.staff_seats && (
                  <span className="block text-sm">
                    • {currentPlan.staff_seats} staff seat{currentPlan.staff_seats > 1 ? 's' : ''}
                  </span>
                )}
              </>
            ) : (
              'No plan selected'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onUpgrade}
            variant={currentPlan?.tier === 'starter' ? 'default' : 'outline'}
            size="sm"
            className="w-full"
          >
            {currentPlan?.tier === 'starter' ? 'Upgrade Plan' : 'Manage Subscription'}
          </Button>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>This Month's Usage</span>
            </CardTitle>
            {overLimit && (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Over Limit</span>
              </Badge>
            )}
          </div>
          <CardDescription>
            {usage ? (
              `${usage.reports_used} of ${usage.reports_limit} reports used`
            ) : (
              'Loading usage data...'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress 
            value={usagePercentage} 
            className={cn(
              "h-2",
              overLimit && "bg-destructive/20"
            )}
          />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{usage?.reports_used || 0} used</span>
            <span>{usage?.reports_limit || 0} included</span>
          </div>
          
          {usage && usage.overage_reports > 0 && (
            <div className="text-sm text-destructive font-medium">
              +{usage.overage_reports} overage reports 
              ({formatPrice((currentPlan?.overage_price || 0) * usage.overage_reports)} additional)
            </div>
          )}
          
          <Button 
            onClick={refreshUsage}
            variant="ghost" 
            size="sm"
            className="w-full"
          >
            Refresh Usage
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}