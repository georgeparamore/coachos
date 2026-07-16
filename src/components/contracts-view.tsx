"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContractFormModal } from "@/components/contract-form-modal";
import { CONTRACT_STATUS_BADGE, type Contract, type ContractTemplate } from "@/lib/contracts";
import { centsToDollars } from "@/lib/format";
import type { Lead } from "@/lib/leads";

export function ContractsView({
  contracts,
  templates,
  leads,
  coachId,
}: {
  contracts: Contract[];
  templates: ContractTemplate[];
  leads: Lead[];
  coachId: string;
}) {
  const router = useRouter();
  const [modalTemplateId, setModalTemplateId] = useState<string | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  function openModal(templateId?: string) {
    setModalTemplateId(templateId);
    setShowModal(true);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Contracts</div>
          <div className="page-sub">Digital agreements and e-signatures</div>
        </div>
        <button className="btn btn-primary" onClick={() => openModal(undefined)}>
          New contract
        </button>
      </div>

      <div className="card">
        <div className="card-title">All contracts</div>
        {contracts.length === 0 ? (
          <div className="empty-state">
            <p>No contracts yet. Click &quot;New contract&quot; to send your first agreement.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Contract type</th>
                <th>Value</th>
                <th>Date sent</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id}>
                  <td>{contract.client_name}</td>
                  <td>{contract.contract_type}</td>
                  <td>{contract.value_cents ? centsToDollars(contract.value_cents) : "—"}</td>
                  <td>{new Date(contract.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${CONTRACT_STATUS_BADGE[contract.status]}`}>{contract.status}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/sign/${contract.sign_token}`)}
                    >
                      Copy link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="card-title">Contract templates</div>
        {templates.map((template) => (
          <div className="list-row" key={template.id}>
            <div className="list-row-left">
              <div>
                <div className="name">{template.name}</div>
                <div className="sub">{template.summary}</div>
              </div>
            </div>
            <button className="btn btn-sm" onClick={() => openModal(template.id)}>
              Use template
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <ContractFormModal
          leads={leads}
          templates={templates}
          initialTemplateId={modalTemplateId}
          coachId={coachId}
          onClose={() => setShowModal(false)}
          onCreated={() => router.refresh()}
        />
      )}
    </>
  );
}
