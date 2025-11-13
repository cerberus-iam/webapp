import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { requireAuth } from "@/lib/auth/redirects";
import { AppLayout } from "@/layouts/app";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

import data from "../content/data.json";

export default function DashboardPage({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <AppLayout user={user} breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} />
      </div>
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  requireAuth(context, async () => ({}));
