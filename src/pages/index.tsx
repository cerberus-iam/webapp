import { GetServerSideProps } from 'next';

export default function Home() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  // Always redirect to dashboard - dashboard will handle auth and redirect to login if needed
  return {
    redirect: {
      destination: '/dashboard',
      permanent: false,
    },
  };
};
