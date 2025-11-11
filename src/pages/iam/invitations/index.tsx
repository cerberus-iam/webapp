import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/app-layout';
import type { NextPageWithLayout } from '@/types/page';

const InvitationsPage: NextPageWithLayout = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitation tracking is not available yet</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Manage pending invites, resend emails, and revoke access requests from here once the
          experience ships.
        </p>
      </CardContent>
    </Card>
  );
};

InvitationsPage.getLayout = (page) => (
  <AppLayout
    title="Invitations"
    description="Review and manage pending invitations to your organisation."
    breadcrumbs={[{ label: 'IAM', href: '/iam/users' }, { label: 'Invitations' }]}
  >
    {page}
  </AppLayout>
);

export default InvitationsPage;
