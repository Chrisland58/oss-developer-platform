import { useState } from "react";

export type KeygenMethod = "passkey" | "generated";

export interface WalletSetupState {
  step: 1 | 2 | 3;
  publicKey: string | null;
  contractAddress: string | null;
  isLoading: boolean;
  error: string | null;
  createWallet: (method: KeygenMethod) => Promise<void>;
}

/**
 * useWalletSetup
 *
 * Manages the three-step wallet creation flow:
 * 1. Generate ed25519 keypair (Passkey or random)
 * 2. Deploy SorobanAuthWallet contract (gas sponsored)
 * 3. Confirm wallet is ready
 *
 * In production, step 2 calls the deployed Paymaster contract
 * to initialize and fund the SorobanAuthWallet on behalf of the user.
 */
export function useWalletSetup(): WalletSetupState {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWallet = async (method: KeygenMethod) => {
    setIsLoading(true);
    setError(null);

    try {
      // --- Step 1: Generate keypair ---
      let pubKey: string;

      if (method === "passkey") {
        // In production: call WebAuthn navigator.credentials.create()
        // and derive an ed25519 public key from the authenticator response.
        // For now, simulate with a placeholder.
        pubKey = await simulatePasskeyKeygen();
      } else {
        // In production: use @stellar/stellar-sdk Keypair.random()
        pubKey = await simulateRandomKeygen();
      }

      setPublicKey(pubKey);
      setStep(2);

      // Yield to React so step 2 renders before we kick off deployment
      await delay(0);

      // --- Step 2: Deploy SorobanAuthWallet via Paymaster ---
      // In production: invoke the Paymaster contract which calls
      // SorobanAuthWallet.initialize(pubkey) and pays the fees.
      const contractAddr = await simulateContractDeploy(pubKey);

      setContractAddress(contractAddr);
      setStep(3);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { step, publicKey, contractAddress, isLoading, error, createWallet };
}

// ---------------------------------------------------------------------------
// Simulation stubs (replace with real Stellar SDK calls in production)
// ---------------------------------------------------------------------------

async function simulatePasskeyKeygen(): Promise<string> {
  await delay(800);
  // Placeholder: real implementation uses WebAuthn + P-256 → ed25519 derivation
  return "GCABC" + randomHex(51);
}

async function simulateRandomKeygen(): Promise<string> {
  await delay(400);
  // Placeholder: real implementation: Keypair.random().publicKey()
  return "GDXYZ" + randomHex(51);
}

async function simulateContractDeploy(pubKey: string): Promise<string> {
  await delay(1500);
  // Placeholder: real implementation submits a Soroban transaction
  // that deploys the contract WASM and calls initialize(pubKey)
  void pubKey;
  return "C" + randomHex(55);
}

function randomHex(length: number): string {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 36).toString(36).toUpperCase()
  ).join("");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
