import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/settings/invitations',
      permanent: true,
    },
  };
};

export default function InvitationsRedirect() {
  return null;
}
