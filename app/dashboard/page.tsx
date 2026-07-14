import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Pengalih dashboard sesuai role — tujuan tunggal untuk link "Dashboard". */
export default async function DashboardRedirectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile as { role?: string } | null)?.role;
  if (role === "admin") redirect("/dashboard/admin");
  if (role === "owner") redirect("/dashboard/owner");
  redirect("/dashboard/user");
}
