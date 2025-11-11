import Link from 'next/link';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { NextPageWithLayout } from '@/types/page';

const ApiKeysPage: NextPageWithLayout = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Programmatic access is coming soon</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground">
          You&apos;ll be able to mint scoped API keys, set expirations, and review usage analytics
          from this page. We&apos;re putting the final touches on the experience.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild>
          <Link href="/help">Join the beta waitlist</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

ApiKeysPage.getLayout = (page) => (
  <AppLayout
    title="API Keys"
    description="Issue and monitor API keys for service-to-service integrations."
    breadcrumbs={[{ label: 'IAM', href: '/iam/users' }, { label: 'API Keys' }]}
  >
    {page}
  </AppLayout>
);

export default ApiKeysPage;
