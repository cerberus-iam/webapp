import Image from 'next/image';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <Image
              src="/logo.svg"
              alt="Cerberus IAM"
              width={32}
              height={32}
              className="size-8"
            />
            Cerberus IAM
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>

      {/* Starry night background with shooting stars */}
      <div className="relative hidden overflow-hidden bg-[#172554] lg:block">
        {/* Stars layer */}
        <div className="stars-small absolute inset-0" />
        <div className="stars-medium absolute inset-0" />
        <div className="stars-large absolute inset-0" />

        {/* Shooting stars */}
        <div className="shooting-star shooting-star-1" />
        <div className="shooting-star shooting-star-2" />
        <div className="shooting-star shooting-star-3" />
        <div className="shooting-star shooting-star-4" />

        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#0f172a]/50" />
      </div>
    </div>
  );
}
