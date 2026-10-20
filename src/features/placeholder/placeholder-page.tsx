import { PageContainer } from '../../components/shared/page-container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Terminal, CheckCircle2, Layers } from 'lucide-react';

export interface PlaceholderPageProps {
  moduleName: string;
  description: string;
  workflowCommand: string;
  dbmlTables: string[];
  features: string[];
}

export function PlaceholderPage({
  moduleName,
  description,
  workflowCommand,
  dbmlTables,
  features,
}: PlaceholderPageProps) {
  return (
    <PageContainer
      title={moduleName}
      description={description}
      actions={<Badge variant="cream">Slice Ready</Badge>}
    >
      <div className="space-y-6">
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-none bg-canvas-soft text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Vertical Slice Specification</CardTitle>
                <CardDescription>
                  This module foundation is registered. To implement its end-to-end backend, TypeORM entities, API endpoints, and React UI:
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Workflow invocation box */}
            <div className="rounded-none bg-canvas-cream p-4 border border-hairline">
              <p className="text-xs font-bold text-ink uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-primary" />
                <span>Antigravity Workflow Command</span>
              </p>
              <div className="rounded-none bg-surface-aubergine p-3 font-mono text-sm text-on-primary select-all">
                {workflowCommand}
              </div>
            </div>

            {/* Scope / Features */}
            <div>
              <h4 className="text-sm font-bold text-ink mb-2">Target Capabilities in this Slice:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-ink-mute">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-semantic-success shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DBML Tables */}
            <div>
              <h4 className="text-sm font-bold text-ink mb-2">Mapped DBML Tables:</h4>
              <div className="flex flex-wrap gap-2">
                {dbmlTables.map((table) => (
                  <span
                    key={table}
                    className="font-mono text-xs bg-canvas-soft text-ink px-2.5 py-1 rounded-none border border-hairline"
                  >
                    {table}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
