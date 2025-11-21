import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/access-control/roles',
      permanent: true,
    },
  };
};

export default function RolesRedirect() {
  return null;
}
