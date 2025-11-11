import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/app-layout';
import type { NextPageWithLayout } from '@/types/page';

const HelpPage: NextPageWithLayout = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
          <CardDescription>Guides, API references, and integration walkthroughs.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>
              <a
                className="hover:text-primary"
                href="https://docs.cerberus.iam"
                target="_blank"
                rel="noreferrer"
              >
                Developer documentation
              </a>
            </li>
            <li>
              <a
                className="hover:text-primary"
                href="https://status.cerberus.iam"
                target="_blank"
                rel="noreferrer"
              >
                Service status
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Support</CardTitle>
          <CardDescription>Reach the Cerberus IAM team for assistance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Email:{' '}
            <a className="hover:text-primary" href="mailto:support@cerberus.iam">
              support@cerberus.iam
            </a>
          </p>
          <p>
            Slack:{' '}
            <a
              className="hover:text-primary"
              href="https://cerberus-iam.slack.com"
              target="_blank"
              rel="noreferrer"
            >
              #admin-support
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

HelpPage.getLayout = (page) => (
  <AppLayout
    title="Help & Support"
    description="Find answers and connect with the Cerberus IAM team."
  >
    {page}
  </AppLayout>
);

export default HelpPage;
