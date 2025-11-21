import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/settings/api-keys',
      permanent: true,
    },
  };
};

export default function ApiKeysRedirect() {
  return null;
}
