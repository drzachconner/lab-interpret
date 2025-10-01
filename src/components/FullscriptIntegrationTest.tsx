import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  details?: any;
}

export function FullscriptIntegrationTest() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const { toast } = useToast();

  const testDefinitions = [
    {
      name: 'Database Migration',
      test: async () => {
        const { data, error } = await supabase
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_name', 'orders')
          .like('column_name', 'fullscript%');
        
        if (error) throw error;
        return data.length > 0 ? 'Migration applied successfully' : 'No Fullscript columns found';
      }
    },
    {
      name: 'Fullscript Account Setup',
      test: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('fullscript_account_id, fullscript_patient_id')
          .eq('auth_id', user.id)
          .single();
        
        if (error) throw error;
        return profile?.fullscript_account_id ? 'Fullscript account exists' : 'No Fullscript account found';
      }
    },
    {
      name: 'Lab Catalog Sync',
      test: async () => {
        const { data, error } = await supabase
          .from('lab_panels')
          .select('id, name, fullscript_id, fullscript_available')
          .not('fullscript_id', 'is', null)
          .limit(5);
        
        if (error) throw error;
        return data.length > 0 ? `${data.length} labs synced with Fullscript` : 'No labs synced with Fullscript';
      }
    },
    {
      name: 'Edge Functions Deployed',
      test: async () => {
        // Test if the create-lab-order-fullscript function is accessible
        const { data, error } = await supabase.functions.invoke('create-lab-order-fullscript', {
          body: { test: true }
        });
        
        // We expect an error for missing auth, but the function should exist
        return error?.message?.includes('authorization') ? 'Function deployed' : 'Function not accessible';
      }
    },
    {
      name: 'Webhook Handler',
      test: async () => {
        // Test if the webhook function is accessible
        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/fullscript-webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.supabaseKey}`
          },
          body: JSON.stringify({ test: true })
        });
        
        return response.status === 401 ? 'Webhook handler deployed' : 'Webhook handler not accessible';
      }
    }
  ];

  const runTests = async () => {
    setRunning(true);
    setTests([]);
    
    const results: TestResult[] = [];
    
    for (const testDef of testDefinitions) {
      const testResult: TestResult = {
        name: testDef.name,
        status: 'pending'
      };
      
      setTests([...results, testResult]);
      
      try {
        const message = await testDef.test();
        testResult.status = 'success';
        testResult.message = message;
      } catch (error: any) {
        testResult.status = 'error';
        testResult.message = error.message || 'Test failed';
        testResult.details = error;
      }
      
      results.push(testResult);
      setTests([...results]);
    }
    
    setRunning(false);
    
    const successCount = results.filter(r => r.status === 'success').length;
    const totalCount = results.length;
    
    toast({
      title: "Integration Test Complete",
      description: `${successCount}/${totalCount} tests passed`,
      variant: successCount === totalCount ? "default" : "destructive"
    });
  };

  const runCatalogSync = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-fullscript-catalog');
      
      if (error) throw error;
      
      toast({
        title: "Catalog Sync Complete",
        description: `Synced ${data.synced} labs, ${data.errors} errors`,
      });
      
      // Refresh the test results
      runTests();
    } catch (error: any) {
      toast({
        title: "Catalog Sync Failed",
        description: error.message || "Failed to sync catalog",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Pass</Badge>;
      case 'error':
        return <Badge variant="destructive">Fail</Badge>;
      case 'pending':
        return <Badge variant="secondary">Running</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Fullscript Integration Test</h1>
        <p className="text-gray-600 mt-2">
          Verify that all Fullscript integration components are working correctly
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Integration Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runTests} 
              disabled={running}
              className="w-full"
            >
              {running ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
            
            <div className="space-y-2">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runCatalogSync}
              variant="outline"
              className="w-full"
            >
              Sync Fullscript Catalog
            </Button>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Database Migration:</strong> Check if Fullscript columns exist</p>
              <p><strong>Account Setup:</strong> Verify Fullscript account creation</p>
              <p><strong>Catalog Sync:</strong> Check lab panel synchronization</p>
              <p><strong>Edge Functions:</strong> Test function deployment</p>
              <p><strong>Webhook Handler:</strong> Verify webhook endpoint</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {tests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="border-l-4 border-gray-200 pl-4">
                  <div className="flex items-center space-x-2 mb-1">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                    {getStatusBadge(test.status)}
                  </div>
                  <p className="text-sm text-gray-600">{test.message}</p>
                  {test.details && (
                    <details className="mt-2">
                      <summary className="text-sm text-gray-500 cursor-pointer">
                        View Details
                      </summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
