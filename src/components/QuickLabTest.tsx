import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, Database, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function QuickLabTest() {
  const [labCount, setLabCount] = useState(0)
  const [hasFullscript, setHasFullscript] = useState(false)
  const [fullscriptCount, setFullscriptCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const { toast } = useToast()
  
  useEffect(() => {
    checkStatus()
  }, [])
  
  async function checkStatus() {
    setLoading(true)
    try {
      // Check total labs
      const { count } = await supabase
        .from('lab_panels')
        .select('*', { count: 'exact', head: true })
      
      setLabCount(count || 0)
      
      // Check how many have Fullscript IDs
      const { count: fsCount } = await supabase
        .from('lab_panels')
        .select('*', { count: 'exact', head: true })
        .not('fullscript_lab_id', 'is', null)
      
      setFullscriptCount(fsCount || 0)
      setHasFullscript((fsCount || 0) > 0)
      
    } catch (error) {
      console.error('Status check failed:', error)
      toast({
        title: 'Status Check Failed',
        description: 'Unable to check lab system status',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  async function syncFullscript() {
    setSyncing(true)
    try {
      toast({
        title: 'Sync Started',
        description: 'Syncing Fullscript catalog... This may take a moment.'
      })
      
      const { data, error } = await supabase.functions.invoke('sync-fullscript-labs')
      
      if (error) {
        console.error('Sync error:', error)
        toast({
          title: 'Sync Failed',
          description: error.message || 'Failed to sync Fullscript catalog',
          variant: 'destructive'
        })
      } else {
        console.log('Sync result:', data)
        toast({
          title: 'Sync Complete',
          description: `Successfully synced ${data.synced || 0} lab tests from Fullscript`
        })
        // Refresh status after sync
        await checkStatus()
      }
    } catch (error) {
      console.error('Sync failed:', error)
      toast({
        title: 'Sync Error',
        description: 'An unexpected error occurred during sync',
        variant: 'destructive'
      })
    } finally {
      setSyncing(false)
    }
  }
  
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Checking lab system status...</span>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Lab System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Total Labs:</span>
            <Badge variant="outline">{labCount}</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Fullscript Labs:</span>
            <Badge variant="outline">{fullscriptCount}</Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 rounded-lg bg-background border">
          {hasFullscript ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Fullscript integration active</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Fullscript not connected</span>
            </>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={syncFullscript}
            disabled={syncing}
            className="flex-1"
            variant={hasFullscript ? "outline" : "default"}
          >
            {syncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {hasFullscript ? 'Re-sync' : 'Sync'} Fullscript
              </>
            )}
          </Button>
          
          <Button
            onClick={checkStatus}
            variant="outline"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {hasFullscript && (
          <div className="text-xs text-muted-foreground p-2 bg-green-50 rounded border-l-4 border-green-200">
            ✅ Ready to process lab orders with Fullscript integration
          </div>
        )}
      </CardContent>
    </Card>
  )
}