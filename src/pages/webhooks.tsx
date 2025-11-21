import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/settings/webhooks',
      permanent: true,
    },
  };
};

export default function WebhooksRedirect() {
  return null;
}
