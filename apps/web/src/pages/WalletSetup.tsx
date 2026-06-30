import { useWalletSetup } from "../hooks/useWalletSetup";

/**
 * WalletSetup Page
 *
 * Guides a developer through zero-friction onboarding using SorobanAuth:
 * 1. Generate or import an ed25519 keypair (via Passkey/WebAuthn or manual)
 * 2. Deploy the SorobanAuthWallet contract (gas sponsored by a Paymaster)
 * 3. Confirm wallet is ready for signing transactions
 */
export default function WalletSetup() {
  const { step, publicKey, contractAddress, isLoading, error, createWallet } =
    useWalletSetup();

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Wallet Setup</h1>
        <p className="mt-2 text-gray-400 text-sm leading-relaxed">
          Get started on Stellar without holding XLM. A Paymaster sponsors your
          first transactions — no wallet setup, no gas tokens required.
        </p>
      </div>

      {/* Progress Steps */}
      <ol className="flex gap-4 text-sm" aria-label="Setup progress">
        {["Generate Key", "Deploy Contract", "Ready"].map((label, i) => {
          const current = i + 1;
          const isDone = step > current;
          const isActive = step === current;
          return (
            <li
              key={label}
              className={`flex items-center gap-2 ${
                isDone
                  ? "text-green-400"
                  : isActive
                  ? "text-indigo-400 font-medium"
                  : "text-gray-600"
              }`}
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                  isDone
                    ? "border-green-400 bg-green-400/10"
                    : isActive
                    ? "border-indigo-400 bg-indigo-400/10"
                    : "border-gray-700"
                }`}
              >
                {isDone ? "✓" : current}
              </span>
              {label}
            </li>
          );
        })}
      </ol>

      {/* Step Content */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        {step === 1 && (
          <>
            <h2 className="font-semibold text-white">Generate your signing key</h2>
            <p className="text-sm text-gray-400">
              We'll generate an ed25519 keypair. You can use your device's
              biometric authenticator (Passkey/WebAuthn) — no seed phrase
              required.
            </p>
            <button
              onClick={() => createWallet("passkey")}
              disabled={isLoading}
              className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 text-sm font-medium text-white transition-colors"
              aria-label="Create wallet using Passkey"
            >
              {isLoading ? "Generating…" : "Create with Passkey"}
            </button>
            <button
              onClick={() => createWallet("generated")}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-700 hover:border-gray-500 disabled:opacity-50 px-4 py-2.5 text-sm text-gray-300 transition-colors"
              aria-label="Generate a random ed25519 keypair"
            >
              Generate random keypair
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-semibold text-white">Deploying your wallet contract</h2>
            <p className="text-sm text-gray-400">
              Your{" "}
              <code className="text-indigo-400 font-mono text-xs">
                SorobanAuthWallet
              </code>{" "}
              contract is being deployed on Stellar Testnet. A Paymaster is
              covering the transaction fee.
            </p>
            {publicKey && (
              <div className="rounded-lg bg-gray-800 px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">Your public key</p>
                <p className="font-mono text-xs text-gray-200 break-all">
                  {publicKey}
                </p>
              </div>
            )}
            {isLoading && (
              <div
                className="flex items-center gap-2 text-sm text-gray-400"
                role="status"
                aria-live="polite"
              >
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400" />
                Deploying…
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-xl" aria-hidden="true">✓</span>
              <h2 className="font-semibold text-white">Wallet ready</h2>
            </div>
            <p className="text-sm text-gray-400">
              Your gas-sponsored wallet is live. You can now sign transactions
              and interact with Stellar contracts without holding any XLM.
            </p>
            {contractAddress && (
              <div className="rounded-lg bg-gray-800 px-4 py-3 space-y-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contract address</p>
                  <p className="font-mono text-xs text-gray-200 break-all">
                    {contractAddress}
                  </p>
                </div>
                {publicKey && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Public key</p>
                    <p className="font-mono text-xs text-gray-200 break-all">
                      {publicKey}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
