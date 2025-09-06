"use client";

import { useState } from "react";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeumorphicButton } from "./neumorphic-button";

export function DigestSubscribeDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<
    "checking" | "available" | "subscribed" | null
  >(null);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/digest/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setSuccess(true);
      setEmail("");
      setName("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Check email subscription status with debounce
  async function checkEmailStatus(email: string) {
    if (!email || !email.includes("@")) {
      setEmailStatus(null);
      return;
    }

    console.log("Checking email status for:", email);
    setEmailStatus("checking");
    try {
      const res = await fetch("/api/digest/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      console.log("Email check response:", data);

      if (data.exists && data.verified) {
        console.log("Email is already subscribed");
        setEmailStatus("subscribed");
      } else {
        console.log("Email is available");
        setEmailStatus("available");
      }
    } catch (err) {
      console.error("Email check failed:", err);
      setEmailStatus("available"); // Default to available on error
    }
  }

  // Debounced email check
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkEmailStatus(email);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [email]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <NeumorphicButton className="font-dm-sans">
          Subscribe to Digest
        </NeumorphicButton>
      </DialogTrigger>
      <DialogContent className="neumorphic-card text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="font-dm-sans">
            Weekly Startup Digest
          </DialogTitle>
        </DialogHeader>
        {success ? (
          <div className="text-white/80 text-sm space-y-2">
            <p>Check your email to confirm your subscription!</p>
            <p className="text-white/60 text-xs">
              You'll get 4-5 detailed company failure stories every week.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-black border-white/20 focus:border-white text-white placeholder:text-white/40 ${
                    emailStatus === "subscribed"
                      ? "border-red-400"
                      : emailStatus === "available"
                      ? "border-green-400"
                      : ""
                  }`}
                />
                {emailStatus === "checking" && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
                {emailStatus === "subscribed" && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-4 h-4 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                {emailStatus === "available" && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-4 h-4 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {emailStatus === "subscribed" && (
                <p className="text-red-400 text-xs mt-1">
                  This email is already subscribed to the premium digest.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">
                Name (optional)
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black border-white/20 focus:border-white text-white placeholder:text-white/40"
              />
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}
            <NeumorphicButton
              type="submit"
              disabled={loading || emailStatus === "subscribed"}
              className={`w-full font-dm-sans ${
                emailStatus === "subscribed"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {emailStatus === "subscribed"
                ? "Already Subscribed"
                : loading
                ? "Processing..."
                : "Subscribe"}
            </NeumorphicButton>
            <div className="text-xs text-white/50 space-y-1">
              <p>• 4-5 detailed startup failure stories weekly</p>
              <p>• Analysis of what went wrong and why</p>
              <p>• Free • Unsubscribe anytime</p>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
