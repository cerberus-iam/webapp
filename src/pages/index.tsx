import { AppLayout } from '@/components/layout/app-layout';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import data from '@/app/dashboard/data.json';
import type { NextPageWithLayout } from '@/types/page';

const Home: NextPageWithLayout = () => {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <SectionCards />
      <div className="px-0 lg:px-2">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </div>
  );
};

Home.getLayout = (page) => (
  <AppLayout title="Dashboard" description="Monitor everything happening across your tenant.">
    {page}
  </AppLayout>
);

export default Home;
