import Link from "next/link";

/**
 * Shown when a share id does not resolve.
 *
 * Almost always means the author revoked the link (or it aged out), so the copy
 * says that rather than "404" and points at the one useful next step.
 */
export default function ShareNotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
      }}
    >
      <div className="ambient" />
      <div
        className="glass-1"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 420,
          borderRadius: 14,
          padding: "36px 28px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "var(--text-primary)",
          }}
        >
          This link is no longer available
        </h1>
        <p
          style={{
            margin: "0 0 22px",
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--text-muted)",
          }}
        >
          The test was unshared by whoever sent it, or the link has expired. Ask
          them for a fresh one.
        </p>
        <Link href="/app" className="tprimary focus-ring" style={{ textDecoration: "none" }}>
          Run your own test
        </Link>
      </div>
    </main>
  );
}
