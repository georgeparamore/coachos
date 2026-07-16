import { createClient } from "@/lib/supabase/server";
import { BusinessProfileForm } from "@/components/business-profile-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user!.id)
    .single();

  const integrations = [
    { name: "Stripe", sub: "Subscriptions & payments", envVar: "STRIPE_SECRET_KEY" },
    { name: "Bunny.net", sub: "Video hosting & streaming", envVar: "BUNNY_API_KEY" },
    { name: "Email (SMTP)", sub: "Automated client notifications", envVar: "SMTP settings" },
    { name: "Supabase", sub: "Database, auth & user accounts", envVar: "NEXT_PUBLIC_SUPABASE_URL" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-sub">Manage your platform, branding, and integrations</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Business profile</div>
          <BusinessProfileForm fullName={profile?.full_name ?? ""} email={profile?.email ?? user!.email ?? ""} />
        </div>

        <div>
          <div className="card">
            <div className="card-title">Integrations</div>
            {integrations.map((integration) => (
              <div className="list-row" key={integration.name}>
                <div className="list-row-left">
                  <div>
                    <div className="name">{integration.name}</div>
                    <div className="sub">{integration.sub}</div>
                  </div>
                </div>
                <span className="badge badge-amber">
                  {integration.name === "Supabase" ? "Connected" : "Connect when live"}
                </span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">Platform status</div>
            <div className="list-row">
              <div className="sub">Mode</div>
              <span className="badge badge-green">Phase 1 — CRM live</span>
            </div>
            <div className="list-row">
              <div className="sub">Data storage</div>
              <span className="badge badge-blue">Supabase</span>
            </div>
            <div className="list-row">
              <div className="sub">Payments</div>
              <span className="badge badge-amber">Not connected</span>
            </div>
            <div className="list-row">
              <div className="sub">Video hosting</div>
              <span className="badge badge-amber">Not connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
