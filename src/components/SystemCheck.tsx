import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function SystemCheck() {
  const [status, setStatus] = useState<any>({})
  
  useEffect(() => {
    checkSystem()
  }, [])
  
  async function checkSystem() {
    // Check Supabase connection
    const { data: { user } } = await supabase.auth.getUser()
    
    // Check tables
    const { count: labCount } = await supabase
      .from('lab_panels')
      .select('*', { count: 'exact', head: true })
    
    const { count: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    setStatus({
      supabase: '✅ Connected',
      user: user ? '✅ Authenticated' : '❌ Not logged in',
      labs: `${labCount || 0} labs`,
      profiles: `${profileCount || 0} profiles`
    })
  }
  
  return (
    <div className="p-4 bg-muted rounded-lg">
      <h3 className="font-bold mb-2">System Status</h3>
      {Object.entries(status).map(([key, value]) => (
        <p key={key} className="text-sm">
          <span className="font-medium">{key}:</span> {String(value)}
        </p>
      ))}
    </div>
  )
}