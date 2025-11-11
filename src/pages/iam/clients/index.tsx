import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/app-layout';
import type { NextPageWithLayout } from '@/types/page';

const ClientsPage: NextPageWithLayout = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>OAuth client management is nearly here</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Register confidential and public clients, rotate secrets, and configure redirect URIs from
          this space once the feature lands.
        </p>
      </CardContent>
    </Card>
  );
};

ClientsPage.getLayout = (page) => (
  <AppLayout
    title="OAuth Clients"
    description="Manage the applications that rely on Cerberus IAM for authentication."
    breadcrumbs={[{ label: 'IAM', href: '/iam/users' }, { label: 'OAuth Clients' }]}
  >
    {page}
  </AppLayout>
);

export default ClientsPage;
