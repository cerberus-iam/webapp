import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/app-layout';
import type { NextPageWithLayout } from '@/types/page';

const TeamsPage: NextPageWithLayout = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teams are on the roadmap</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Group people together to mirror departments and projects. You&apos;ll be able to assign
          roles and policies to teams very soon.
        </p>
      </CardContent>
    </Card>
  );
};

TeamsPage.getLayout = (page) => (
  <AppLayout
    title="Teams"
    description="Organise users into functional teams and delegate permissions."
    breadcrumbs={[{ label: 'IAM', href: '/iam/users' }, { label: 'Teams' }]}
  >
    {page}
  </AppLayout>
);

export default TeamsPage;
