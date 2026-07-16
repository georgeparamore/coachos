export type ContractStatus = "draft" | "sent" | "viewed" | "signed";

export type ContractTemplate = {
  id: string;
  coach_id: string;
  name: string;
  summary: string;
  body: string;
};

export type Contract = {
  id: string;
  coach_id: string;
  lead_id: string | null;
  template_id: string | null;
  client_name: string;
  client_email: string | null;
  contract_type: string;
  value_cents: number | null;
  body: string;
  status: ContractStatus;
  sign_token: string;
  signer_name: string | null;
  signed_at: string | null;
  created_at: string;
};

export const CONTRACT_STATUS_BADGE: Record<ContractStatus, string> = {
  draft: "badge-blue",
  sent: "badge-amber",
  viewed: "badge-purple",
  signed: "badge-green",
};
