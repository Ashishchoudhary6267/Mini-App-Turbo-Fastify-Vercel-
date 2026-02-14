"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ShieldCheck, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { encryptData } from "@/lib/encryption";
import { cn } from "@/lib/utils";

import { TransactionSchema, TRANSACTION_TYPES } from "@repo/shared";

type TransactionFormValues = z.infer<typeof TransactionSchema>;

export function TransactionForm(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [encryptedPayload, setEncryptedPayload] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      amount: 0,
      currency: "USD",
      recipient: "",
      type: "PAYMENT",
    },
  });

  async function onSubmit(data: TransactionFormValues) {
    setIsLoading(true);
    setResult(null);
    setEncryptedPayload(null);

    try {
      const encrypted = await encryptData(data);
      setEncryptedPayload(encrypted);

      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/transaction', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: encrypted }),
      });

      const resultData = await response.json();

      if (!response.ok) {
        throw new Error(resultData.error || "Transaction failed");
      }

      setResult(resultData);
      // reset(); // Optionally reset
    } catch (error) {
      console.error(error);
      setResult({ success: false, error: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-500" />
            Secure Transaction
          </CardTitle>
          <CardDescription>
            Send an encrypted transaction to the secure vault.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Amount</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("amount", {
                  valueAsNumber: true,
                  onChange: (e) => {
                    // Ensure it's treated as number
                  }
                })}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Currency</label>
                <Input
                  placeholder="USD"
                  maxLength={3}
                  {...register("currency")}
                />
                {errors.currency && <p className="text-sm text-red-500">{errors.currency.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Type</label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("type")}
                >
                  {TRANSACTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Recipient</label>
              <Input placeholder="John Doe" {...register("recipient")} />
              {errors.recipient && <p className="text-sm text-red-500">{errors.recipient.message}</p>}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Encrypting & Sending..." : "Secure Send"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {encryptedPayload && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock className="h-4 w-4" /> Encrypted Payload (Intercepted)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs break-all whitespace-pre-wrap font-mono p-4 bg-black text-green-400 rounded-md">
              {encryptedPayload}
            </pre>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className={cn("border-l-4", result.success ? "border-green-500" : "border-red-500")}>
          <CardHeader>
            <CardTitle>{result.success ? "Success" : "Error"}</CardTitle>
            <CardDescription>
              {result.success ? `Transaction ID: ${result.id}` : result.error}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
