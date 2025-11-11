import Link from 'next/link';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NextPageWithLayout } from '@/types/page';

const RolesPage: NextPageWithLayout = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Role management is coming soon</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground">
            We&apos;re building a streamlined experience for defining organisation roles, assigning
            permissions, and tracking changes. Check back shortly or contact support if you need
            early access.
          </p>
          <div>
            <Button variant="outline" asChild>
              <Link href="/help">Contact support</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

RolesPage.getLayout = (page) => (
  <AppLayout
    title="Roles"
    description="Create and manage role-based access for your teams."
    breadcrumbs={[{ label: 'IAM', href: '/iam/users' }, { label: 'Roles' }]}
  >
    {page}
  </AppLayout>
);

export default RolesPage;
