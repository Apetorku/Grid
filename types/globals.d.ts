// Global type declarations

// Extend Window interface to include ethereum (MetaMask)
interface Window {
  ethereum?: any
}

// Extend global namespace
declare global {
  interface Window {
    ethereum?: any
  }
}

export {}
