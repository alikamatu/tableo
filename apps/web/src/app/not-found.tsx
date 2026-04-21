import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold gradient-text">404</h1>
      <p className="text-lg text-default-500">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-600"
      >
        Go Home
      </Link>
    </div>
  );
}
