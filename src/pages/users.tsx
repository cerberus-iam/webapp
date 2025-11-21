import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/directory/users',
      permanent: true,
    },
  };
};

export default function UsersRedirect() {
  return null;
}
