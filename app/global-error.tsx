"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Suppress MetaMask-related errors
  if (
    error.message?.includes("MetaMask") ||
    error.stack?.includes("chrome-extension://") ||
    error.stack?.includes("nkbihfbeogaeaoehlefnkodbefgpgknn")
  ) {
    // Silently ignore MetaMask errors since we don't use Web3
    console.warn(
      "MetaMask extension interference detected and suppressed:",
      error.message,
    );
    return null;
  }

  return (
    <html>
      <body>
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
          <h2>Something went wrong!</h2>
          <p>{error.message}</p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              background: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
