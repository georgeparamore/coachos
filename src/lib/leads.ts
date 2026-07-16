export const LEAD_STAGES = [
  { key: "new", label: "New leads", badge: "badge-blue" },
  { key: "in_conversation", label: "In conversation", badge: "badge-amber" },
  { key: "proposal_sent", label: "Proposal sent", badge: "badge-purple" },
  { key: "signed", label: "Signed clients", badge: "badge-green" },
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number]["key"];

export type Lead = {
  id: string;
  coach_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  stage: LeadStage;
  value_cents: number | null;
  fit_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadInput = {
  name: string;
  email: string;
  phone: string;
  source: string;
  stage: LeadStage;
  value_cents: number | null;
  fit_score: number | null;
  notes: string;
};
