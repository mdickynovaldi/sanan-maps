import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: outlet } = await supabase
    .from("outlets")
    .select("name, description, address")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (!outlet) {
    return {
      title: "Outlet - Sanan Explorer",
      description: "Detail outlet UMKM di kawasan Sanan, Malang.",
    };
  }

  const o = outlet as unknown as { name: string; description: string; address: string };

  return {
    title: `${o.name} - UMKM Sanan Malang`,
    description: `${o.description.slice(0, 155)}...`,
    openGraph: {
      title: `${o.name} - UMKM Sanan Malang`,
      description: o.description.slice(0, 155),
      type: "website",
    },
  };
}

export default function OutletDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
