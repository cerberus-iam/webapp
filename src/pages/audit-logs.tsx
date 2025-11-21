import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/audit/logs',
      permanent: true,
    },
  };
};

export default function AuditLogsRedirect() {
  return null;
}
