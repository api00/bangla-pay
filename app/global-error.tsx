"use client"; // global-error must be a Client Component

interface GlobalErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

// global-error replaces the root layout when active, so it must declare its
// own <html> and <body>.
export default function GlobalError({ error, unstable_retry }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "#f7f9f5",
          color: "#0e0f0c",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "#9fe870",
              marginBottom: 24,
            }}
          >
            500
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 12px" }}>
            Something went very wrong.
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#454745",
              lineHeight: 1.55,
              margin: "0 0 24px",
            }}
          >
            Our error reporting will pick this up. Try refreshing the page.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: 11,
                color: "#868685",
                fontVariantNumeric: "tabular-nums",
                marginBottom: 24,
              }}
            >
              Reference · {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              border: "none",
              cursor: "pointer",
              height: 48,
              padding: "0 24px",
              borderRadius: 9999,
              backgroundColor: "#9fe870",
              color: "#163300",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
