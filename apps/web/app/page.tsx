import { TransactionForm } from "@/components/transaction-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          SecureVault <span className="text-primary">Transaction</span>
        </h1>
        <p className="text-muted-foreground">
          AES-256-GCM Encrypted Transaction Layer
        </p>
      </div>
      <TransactionForm />
    </main>
  );
}
