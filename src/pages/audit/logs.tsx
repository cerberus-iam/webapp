import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/app-layout';
import type { NextPageWithLayout } from '@/types/page';

const AuditLogsPage: NextPageWithLayout = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit visibility is in progress</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          A detailed activity log will live here, covering authentication events, configuration
          changes, and privileged actions across your tenant.
        </p>
      </CardContent>
    </Card>
  );
};

AuditLogsPage.getLayout = (page) => (
  <AppLayout
    title="Audit Logs"
    description="Track critical events across Cerberus IAM."
    breadcrumbs={[{ label: 'Audit' }, { label: 'Logs' }]}
  >
    {page}
  </AppLayout>
);

export default AuditLogsPage;
