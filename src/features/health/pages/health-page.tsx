import { useDetailedHealth } from '../data/health-data';
import { PageContainer } from '../../../components/shared/page-container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { LoadingState } from '../../../components/shared/loading-state';
import { Database, Server, Cpu, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export function HealthPage() {
  const { data: health, isLoading, isError, refetch, isFetching } = useDetailedHealth();

  return (
    <PageContainer
      title="System Health & Infrastructure"
      description="Demo environment status. Infrastructure metrics are simulated."
      actions={
        <Button
          variant="primary-pill"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </Button>
      }
    >
      {isLoading ? (
        <LoadingState message="Loading demo environment status..." />
      ) : isError ? (
        <Card variant="default" className="border-semantic-error/40 bg-semantic-error/5">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-12 w-12 text-semantic-error" />
            <h3 className="mt-4 text-lg font-bold text-ink">Demo Data Unavailable</h3>
            <p className="mt-2 text-sm text-ink-mute max-w-md">
              Unable to load local demo data. Reload the page to try again.
            </p>
            <Button
              variant="primary-pill"
              size="sm"
              onClick={() => refetch()}
              className="mt-6"
            >
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      ) : health ? (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="flex items-center justify-between rounded-none bg-canvas-soft p-6 border border-hairline">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-none bg-semantic-success text-white">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">Overall System Status: {health.status.toUpperCase()}</h3>
                <p className="text-sm text-ink-mute">
                  Uptime: {Math.floor(health.uptime / 60)} minutes ({health.uptime} seconds) · Environment: {health.environment}
                </p>
              </div>
            </div>
            <Badge variant="success">All Systems Operational</Badge>
          </div>

          {/* Grid of Components */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Backend API */}
            <Card variant="default">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-primary" />
                    <span>Local Demo Environment</span>
                  </CardTitle>
                  <Badge variant="success">Online</Badge>
                </div>
                <CardDescription>Browser-local mock data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-hairline">
                  <span className="text-ink-mute">Protocol:</span>
                  <span className="font-semibold text-ink">HTTP/REST</span>
                </div>
                <div className="flex justify-between py-1 border-b border-hairline">
                  <span className="text-ink-mute">Data source:</span>
                  <span className="font-mono text-xs text-ink">Browser storage</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-ink-mute">Status:</span>
                  <span className="font-semibold text-semantic-success">200 OK</span>
                </div>
              </CardContent>
            </Card>

            {/* PostgreSQL Database */}
            <Card variant="default">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    <span>PostgreSQL Database</span>
                  </CardTitle>
                  <Badge variant={health.database.status === 'connected' ? 'success' : 'secondary'}>
                    {health.database.status}
                  </Badge>
                </div>
                <CardDescription>Primary Data Store (TypeORM)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-hairline">
                  <span className="text-ink-mute">Status:</span>
                  <span className="font-semibold text-ink">{health.database.status}</span>
                </div>
                {health.database.responseTimeMs !== undefined && (
                  <div className="flex justify-between py-1 border-b border-hairline">
                    <span className="text-ink-mute">Ping Latency:</span>
                    <span className="font-semibold text-ink">{health.database.responseTimeMs} ms</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-ink-mute">DBML Entities:</span>
                  <span className="font-semibold text-ink">Ready</span>
                </div>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card variant="default">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    <span>Resource Telemetry</span>
                  </CardTitle>
                  <Badge variant="outline">Telemetry</Badge>
                </div>
                <CardDescription>Node.js Process Metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-hairline">
                  <span className="text-ink-mute">Heap Used:</span>
                  <span className="font-semibold text-ink">{health.memory.heapUsedMb} MB</span>
                </div>
                <div className="flex justify-between py-1 border-b border-hairline">
                  <span className="text-ink-mute">Heap Total:</span>
                  <span className="font-semibold text-ink">{health.memory.heapTotalMb} MB</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-ink-mute">RSS Memory:</span>
                  <span className="font-semibold text-ink">{health.memory.rssMb} MB</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}
