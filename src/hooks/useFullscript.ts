import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function useFullscript() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  async function createLabPlan(labIds: string[], zipCode: string) {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase.functions.invoke('create-fullscript-plan', {
        body: { 
          labIds, 
          userId: user?.id,
          zipCode 
        }
      })
      
      if (error) throw error
      
      return data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create lab plan",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }
  
  async function syncCatalog() {
    const { data, error } = await supabase.functions.invoke('sync-fullscript-labs')
    if (error) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive"
      })
    } else {
      toast({
        title: "Success",
        description: `Synced ${data.synced} labs`
      })
    }
    return { data, error }
  }
  
  return { createLabPlan, syncCatalog, loading }
}