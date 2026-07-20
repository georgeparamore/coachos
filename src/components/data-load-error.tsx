export function DataLoadError({ what, refId }: { what: string; refId?: string | null }) {
  return (
    <div className="notes-box" style={{ background: "var(--red-bg)", color: "var(--red-text)" }}>
      Couldn&apos;t load {what} right now. This has been reported — try refreshing the page in a moment.
      {refId && <span style={{ opacity: 0.75 }}> (ref: {refId})</span>}
    </div>
  );
}
