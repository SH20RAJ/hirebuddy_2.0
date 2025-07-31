import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export const AdminDebugInfo = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebugQuery = async () => {
    setLoading(true);
    try {
      // Test direct query without RLS
      const { data: allData, error: allError } = await supabase
        .from('hirebuddy_job_applications')
        .select('*')
        .limit(5);

      // Test RLS query
      const { data: rlsData, error: rlsError } = await supabase
        .from('hirebuddy_job_applications')
        .select('*')
        .limit(5);

      // Test admin function if it exists
      const { data: adminFuncData, error: adminFuncError } = await supabase
        .rpc('get_all_job_applications_admin', {
          limit_count: 5
        });

      // Get current user info
      const { data: userData, error: userError } = await supabase.auth.getUser();

      setDebugInfo({
        user: userData?.user,
        userEmail: user?.email,
        allData,
        allError,
        rlsData,
        rlsError,
        adminFuncData,
        adminFuncError,
        userError
      });
    } catch (error) {
      console.error('Debug query error:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Admin Debug Information</CardTitle>
        <Button onClick={runDebugQuery} disabled={loading}>
          {loading ? 'Running...' : 'Run Debug Query'}
        </Button>
      </CardHeader>
      <CardContent>
        {debugInfo && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">User Info</h3>
              <div className="bg-gray-100 p-3 rounded text-sm">
                <p><strong>Email:</strong> {debugInfo.userEmail}</p>
                <p><strong>User ID:</strong> {debugInfo.user?.id}</p>
                <p><strong>Role:</strong> {debugInfo.user?.role}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Direct Query Results</h3>
              <div className="bg-gray-100 p-3 rounded text-sm">
                {debugInfo.allError ? (
                  <p className="text-red-600">Error: {debugInfo.allError.message}</p>
                ) : (
                  <p>Found {debugInfo.allData?.length || 0} applications</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">RLS Query Results</h3>
              <div className="bg-gray-100 p-3 rounded text-sm">
                {debugInfo.rlsError ? (
                  <p className="text-red-600">Error: {debugInfo.rlsError.message}</p>
                ) : (
                  <p>Found {debugInfo.rlsData?.length || 0} applications</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Admin Function Results</h3>
              <div className="bg-gray-100 p-3 rounded text-sm">
                {debugInfo.adminFuncError ? (
                  <p className="text-red-600">Error: {debugInfo.adminFuncError.message}</p>
                ) : (
                  <p>Found {debugInfo.adminFuncData?.length || 0} applications</p>
                )}
              </div>
            </div>

            {debugInfo.allData && debugInfo.allData.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Sample Applications</h3>
                <div className="space-y-2">
                  {debugInfo.allData.slice(0, 3).map((app: any) => (
                    <div key={app.id} className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{app.full_name || 'Unknown'}</span>
                        <Badge variant="outline">{app.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {app.user_email} • {app.job_title} at {app.company_name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 