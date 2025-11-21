import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/directory/teams',
      permanent: true,
    },
  };
};

export default function TeamsRedirect() {
  return null;
}
