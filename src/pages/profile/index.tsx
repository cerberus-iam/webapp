import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AppLayout } from '@/components/layout/app-layout';
import type { NextPageWithLayout } from '@/types/page';
import { useAuth } from '@/hooks/use-auth';

const ProfilePage: NextPageWithLayout = () => {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Name</p>
          <p className="font-medium">{user?.name ?? ''}</p>
        </div>
        <Separator />
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">{user?.email ?? ''}</p>
        </div>
      </CardContent>
    </Card>
  );
};

ProfilePage.getLayout = (page) => (
  <AppLayout title="Profile" description="Manage your personal account information.">
    {page}
  </AppLayout>
);

export default ProfilePage;
