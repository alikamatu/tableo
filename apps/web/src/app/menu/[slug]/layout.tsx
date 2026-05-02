import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function getMenu(slug: string) {
  try {
    const res = await fetch(`${API_URL}/menu/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const menu = await getMenu(slug);

  if (!menu) {
    return {
      title: 'Menu | Tableo',
    };
  }

  const name = menu.branch.name;
  const restaurantName = menu.branch.restaurant?.name || '';

  return {
    title: `${name} - ${restaurantName} Menu | Tableo`,
    description: `View the menu and place your order at ${name}. Powered by Tableo.`,
    openGraph: {
      title: `${name} Menu`,
      description: `Check out our latest dishes and order online.`,
      images: menu.branch.logoUrl ? [menu.branch.logoUrl] : [],
    },
  };
}

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
