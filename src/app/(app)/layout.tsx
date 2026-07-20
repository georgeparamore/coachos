import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name || profile?.email || user.email || "Coach";
  const initials = displayName
    .split(" ")
    .map((part: string) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isDemo = Boolean(process.env.NEXT_PUBLIC_DEMO_EMAIL) && user.email === process.env.NEXT_PUBLIC_DEMO_EMAIL;

  return (
    <div className="app">
      <Sidebar
        userName={displayName}
        userInitials={initials || "C"}
        userPlan={profile?.role === "client" ? "Client" : "Coach"}
      />
      <div className="main">
        {isDemo && (
          <div
            style={{
              background: "var(--amber-bg)",
              color: "var(--amber-text)",
              fontSize: 12.5,
              padding: "8px 32px",
              textAlign: "center",
            }}
          >
            You&apos;re viewing a shared demo workspace — changes are visible to other visitors and may be reset.
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
