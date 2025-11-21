import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/applications/clients',
      permanent: true,
    },
  };
};

export default function ClientsRedirect() {
  return null;
}
