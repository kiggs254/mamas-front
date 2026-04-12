export default function AccountLoading() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
      <div style={{
        width: 36,
        height: 36,
        border: "3px solid var(--color-border, #e5e7eb)",
        borderTopColor: "var(--color-primary, #E8751A)",
        borderRadius: "50%",
        animation: "spin 0.75s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
