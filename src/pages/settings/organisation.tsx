import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/app-layout';
import type { NextPageWithLayout } from '@/types/page';
import { useAuth } from '@/hooks/use-auth';

const OrganisationSettingsPage: NextPageWithLayout = () => {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organisation configuration is coming soon</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground">
          Manage tenant branding, security controls, and lifecycle policies from this workspace.
          We&apos;re working with early design partners, including{' '}
          {user?.organisation?.name ?? 'your team'}.
        </p>
      </CardContent>
    </Card>
  );
};

OrganisationSettingsPage.getLayout = (page) => (
  <AppLayout
    title="Organisation"
    description="Configure tenant-wide policies and preferences."
    breadcrumbs={[{ label: 'Settings' }, { label: 'Organisation' }]}
  >
    {page}
  </AppLayout>
);

export default OrganisationSettingsPage;
