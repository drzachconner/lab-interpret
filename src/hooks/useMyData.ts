// src/hooks/useMyData.ts
import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/supa';
import type { ProfileT, LabOrderT, InterpretationT } from '@/types/zod';

export function useMyProfile() {
  const [profile, setProfile] = useState<ProfileT | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const p = await db.getMyProfile();
      setProfile(p);
    } catch (e: any) {
      setError(e.message || 'Error fetching profile');
      console.error('Error fetching profile:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { 
    profile, 
    loading, 
    error, 
    refetch: fetchProfile 
  };
}

export function useMyOrders() {
  const [orders, setOrders] = useState<LabOrderT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await db.listMyOrders();
      setOrders(list);
    } catch (e: any) {
      setError(e.message || 'Error fetching orders');
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { 
    orders, 
    loading, 
    error, 
    refetch: fetchOrders 
  };
}

export function useMyInterpretations() {
  const [interpretations, setInterpretations] = useState<InterpretationT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterpretations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await db.listMyInterpretations();
      setInterpretations(list);
    } catch (e: any) {
      setError(e.message || 'Error fetching interpretations');
      console.error('Error fetching interpretations:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterpretations();
  }, [fetchInterpretations]);

  return { 
    interpretations, 
    loading, 
    error, 
    refetch: fetchInterpretations 
  };
}

export function useOrder(orderId: string | null) {
  const [order, setOrder] = useState<LabOrderT | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const orderData = await db.getOrder(orderId);
      setOrder(orderData);
    } catch (e: any) {
      setError(e.message || 'Error fetching order');
      console.error('Error fetching order:', e);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return { 
    order, 
    loading, 
    error, 
    refetch: fetchOrder 
  };
}

export function useInterpretation(interpretationId: string | null) {
  const [interpretation, setInterpretation] = useState<InterpretationT | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterpretation = useCallback(async () => {
    if (!interpretationId) {
      setInterpretation(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await db.getInterpretation(interpretationId);
      setInterpretation(data);
    } catch (e: any) {
      setError(e.message || 'Error fetching interpretation');
      console.error('Error fetching interpretation:', e);
    } finally {
      setLoading(false);
    }
  }, [interpretationId]);

  useEffect(() => {
    fetchInterpretation();
  }, [fetchInterpretation]);

  return { 
    interpretation, 
    loading, 
    error, 
    refetch: fetchInterpretation 
  };
}