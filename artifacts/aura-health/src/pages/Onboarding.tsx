import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface OnboardingProps {
  onComplete: (hasPcos: boolean, name: string) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<"welcome" | "name" | "pcos">("welcome");
  const [name, setName] = useState("");

  const handlePcosAnswer = (hasPcos: boolean) => {
    onComplete(hasPcos, name || "Beautiful");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="max-w-xs w-full text-center space-y-10"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">welcome to</p>
              <h1 className="text-5xl font-serif font-light tracking-wide" style={{ color: "#674D66" }}>Glo</h1>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your personal women's health companion.
            </p>
            <button
              onClick={() => setStep("name")}
              className="w-full py-3 rounded-2xl font-medium text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: "#674D66" }}
            >
              Get Started <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {step === "name" && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="max-w-md w-full space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold font-serif mb-2" style={{ color: "#674D66" }}>What shall we call you?</h2>
              <p className="text-muted-foreground">This is just for your personalised daily greeting.</p>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name..."
              className="w-full px-6 py-4 rounded-2xl border-2 text-lg outline-none transition-colors bg-white"
              style={{ borderColor: name ? "#674D66" : "#EBD6DC" }}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep("pcos")}
              autoFocus
            />
            <button
              onClick={() => setStep("pcos")}
              disabled={!name.trim()}
              className="w-full py-3 rounded-2xl font-medium text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
              style={{ background: "#674D66" }}
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === "pcos" && (
          <motion.div
            key="pcos"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="max-w-md w-full space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold font-serif mb-3" style={{ color: "#674D66" }}>Do you have PCOS or PMOS?</h2>
              <p className="text-muted-foreground leading-relaxed">
                This helps us personalise your dashboard, tracking features, and health insights for your specific needs.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handlePcosAnswer(true)}
                className="w-full p-6 rounded-2xl border-2 bg-white text-left hover:border-primary hover:shadow-md transition-all group"
                style={{ borderColor: "#EBD6DC" }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl" style={{ background: "#EBD6DC" }}>
                    🌸
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1" style={{ color: "#674D66" }}>Yes, I have PCOS/PMOS</p>
                    <p className="text-sm text-muted-foreground">We'll activate your PCOS hub with specialised tracking, insulin-aware nutrition, and targeted insights.</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handlePcosAnswer(false)}
                className="w-full p-6 rounded-2xl border-2 bg-white text-left hover:border-primary hover:shadow-md transition-all"
                style={{ borderColor: "#EBD6DC" }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl" style={{ background: "#EBD6DC" }}>
                    🌿
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1" style={{ color: "#674D66" }}>No, general wellness</p>
                    <p className="text-sm text-muted-foreground">We'll set up your standard cycle dashboard with all the core features.</p>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-center text-xs text-muted-foreground">You can change this at any time in Partner Sync &gt; Settings</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
