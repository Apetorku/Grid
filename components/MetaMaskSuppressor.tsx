"use client";

import { useEffect } from "react";

export function MetaMaskSuppressor() {
  useEffect(() => {
    // Suppress Chrome extension errors
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || "";

      // Filter out known extension errors
      if (
        message.includes("Could not establish connection") ||
        message.includes("Receiving end does not exist") ||
        message.includes("chrome-extension://") ||
        message.includes("MetaMask")
      ) {
        return; // Silently ignore
      }

      originalError.apply(console, args);
    };

    // Prevent MetaMask from auto-connecting
    if (typeof window !== "undefined") {
      // Override window.ethereum to prevent MetaMask injection errors
      const originalEthereum = window.ethereum;

      // Create a proxy that catches errors
      if (originalEthereum) {
        const handler = {
          get(target: any, prop: string) {
            // Intercept connect method
            if (prop === "connect" || prop === "request") {
              return () => {
                return Promise.reject(
                  new Error("Web3 is not enabled on this application"),
                );
              };
            }
            return target[prop];
          },
        };

        try {
          window.ethereum = new Proxy(originalEthereum, handler);
        } catch (e) {
          // If proxy fails, just disable ethereum
          console.warn("MetaMask detected but suppressed");
        }
      }

      // Suppress runtime.lastError
      if (typeof (window as any).chrome !== "undefined" && (window as any).chrome.runtime) {
        const originalRuntime = (window as any).chrome.runtime;
        Object.defineProperty((window as any).chrome, "runtime", {
          get() {
            return {
              ...originalRuntime,
              get lastError() {
                return undefined; // Always return undefined to suppress errors
              },
            };
          },
        });
      }
    }

    // Cleanup function
    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
