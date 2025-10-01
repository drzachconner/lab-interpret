import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { getSubdomain } from "@/utils/subdomain";

interface Clinic {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  website_url?: string;
  fullscripts_dispensary_url?: string;
  subscription_status: string;
}

const TenantPortal = () => {
  const { user } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [userClinicId, setUserClinicId] = useState<string | null>(null);
  const [subdomain] = useState(() => getSubdomain());

  useEffect(() => {
    fetchClinicData();
  }, [subdomain]);

  useEffect(() => {
    if (user && clinic) {
      checkUserClinicAccess();
    }
  }, [user, clinic]);

  const fetchClinicData = async () => {
    if (!subdomain) return;

    try {
      const { data: clinicData, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('slug', subdomain)
        .eq('subscription_status', 'active') // Only show active clinics
        .single();

      if (error || !clinicData) {
        console.error('Clinic not found or inactive:', error);
        setClinic(null);
      } else {
        setClinic(clinicData);
        // Apply clinic branding
        applyClinicBranding(clinicData);
      }
    } catch (error) {
      console.error('Error fetching clinic:', error);
      setClinic(null);
    } finally {
      setLoading(false);
    }
  };

  const checkUserClinicAccess = async () => {
    if (!user || !clinic) return;

    try {
      const { data: clinicUser } = await supabase
        .from('clinic_users')
        .select('clinic_id')
        .eq('user_id', user.id)
        .eq('clinic_id', clinic.id)
        .single();

      if (clinicUser) {
        setUserClinicId(clinicUser.clinic_id);
      } else {
        // User is not part of this clinic, add them as a patient
        const { error } = await supabase
          .from('clinic_users')
          .insert({
            clinic_id: clinic.id,
            user_id: user.id,
            role: 'patient'
          });

        if (!error) {
          setUserClinicId(clinic.id);
        }
      }
    } catch (error) {
      console.error('Error checking clinic access:', error);
    }
  };

  const applyClinicBranding = (clinicData: Clinic) => {
    // Apply custom CSS variables for clinic branding
    const root = document.documentElement;
    
    // Convert hex to HSL for CSS variables
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;
      const sum = max + min;
      const l = sum / 2;

      let h = 0;
      let s = 0;

      if (diff !== 0) {
        s = l < 0.5 ? diff / sum : diff / (2 - sum);

        switch (max) {
          case r:
            h = ((g - b) / diff) + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / diff + 2;
            break;
          case b:
            h = (r - g) / diff + 4;
            break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    try {
      const primaryHsl = hexToHsl(clinicData.primary_color);
      const secondaryHsl = hexToHsl(clinicData.secondary_color);
      
      root.style.setProperty('--primary', primaryHsl);
      root.style.setProperty('--secondary', secondaryHsl);
    } catch (error) {
      console.error('Error applying branding:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading {subdomain}...</p>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return <Navigate to="/404" replace />;
  }

  // Pass clinic context to child components
  return (
    <div className="tenant-portal" data-clinic-id={clinic.id}>
      {user && userClinicId ? (
        <Dashboard clinicContext={clinic} />
      ) : (
        <LandingPage clinicContext={clinic} />
      )}
    </div>
  );
};

export default TenantPortal;