import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useReminders() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const scheduleSupplementRefillReminder = async (
    supplementName: string,
    supplyDays: number = 30,
    dosagePerDay?: string
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to schedule reminders",
        variant: "destructive"
      });
      return null;
    }

    try {
      setLoading(true);

      // First create the supplement order record
      const { data: orderData, error: orderError } = await supabase
        .from('supplement_orders')
        .insert({
          user_id: user.id,
          supplement_name: supplementName,
          dosage_per_day: dosagePerDay,
          supply_days: supplyDays,
          status: 'active'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Then schedule the reminder
      const { error: reminderError } = await supabase.rpc(
        'schedule_supplement_refill_reminder',
        {
          p_user_id: user.id,
          p_supplement_order_id: orderData.id,
          p_supplement_name: supplementName,
          p_supply_days: supplyDays
        }
      );

      if (reminderError) throw reminderError;

      toast({
        title: "Reminder scheduled",
        description: `You'll be reminded to reorder ${supplementName} 7 days before it runs out`,
      });

      return orderData.id;

    } catch (error: any) {
      console.error('Error scheduling supplement reminder:', error);
      toast({
        title: "Error",
        description: "Failed to schedule reminder",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const scheduleFutureTestReminder = async (
    labPanelId: string,
    recommendedDate: Date,
    reason: string
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to schedule reminders",
        variant: "destructive"
      });
      return null;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.rpc(
        'schedule_future_test_reminder',
        {
          p_user_id: user.id,
          p_lab_panel_id: labPanelId,
          p_recommended_date: recommendedDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD
          p_reason: reason
        }
      );

      if (error) throw error;

      toast({
        title: "Test reminder scheduled",
        description: `You'll be reminded about ${labPanelId} retesting on ${recommendedDate.toLocaleDateString()}`,
      });

      return data;

    } catch (error: any) {
      console.error('Error scheduling test reminder:', error);
      toast({
        title: "Error",
        description: "Failed to schedule test reminder",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserReminders = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('email_reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data || [];

    } catch (error: any) {
      console.error('Error fetching reminders:', error);
      return [];
    }
  };

  return {
    loading,
    scheduleSupplementRefillReminder,
    scheduleFutureTestReminder,
    getUserReminders
  };
}