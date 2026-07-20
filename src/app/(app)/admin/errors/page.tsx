import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export default async function AdminErrorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user?.email !== adminEmail) {
    notFound();
  }

  const service = createServiceClient();
  const { data: logs } = await service
    .from("error_logs")
    .select("id, context, message, user_email, url, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Error log</div>
          <div className="page-sub">Most recent 100 errors reported from across the app</div>
        </div>
      </div>

      <div className="card">
        {!logs || logs.length === 0 ? (
          <div className="empty-state">
            <p>No errors reported yet — good sign.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Context</th>
                <th>Message</th>
                <th>User</th>
                <th>Ref</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{new Date(log.created_at).toLocaleString()}</td>
                  <td>
                    <span className="badge badge-purple">{log.context}</span>
                  </td>
                  <td style={{ maxWidth: 420 }}>{log.message}</td>
                  <td>{log.user_email || "—"}</td>
                  <td style={{ color: "var(--text-3)", fontSize: 11 }}>{log.id.slice(0, 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
