import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/app-layout';
import type { NextPageWithLayout } from '@/types/page';

const WebhooksPage: NextPageWithLayout = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook delivery is under construction</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Configure event subscriptions and inspect recent deliveries here once the feature is live.
          We&apos;ll announce availability shortly.
        </p>
      </CardContent>
    </Card>
  );
};

WebhooksPage.getLayout = (page) => (
  <AppLayout
    title="Webhooks"
    description="Receive real-time Cerberus IAM events in your downstream systems."
    breadcrumbs={[{ label: 'IAM', href: '/iam/users' }, { label: 'Webhooks' }]}
  >
    {page}
  </AppLayout>
);

export default WebhooksPage;
