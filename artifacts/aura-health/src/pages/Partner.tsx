import { useState } from "react";
import { motion } from "framer-motion";
import { useGetPartnerSync, useUpdatePartnerSync } from "@workspace/api-client-react";
import { Users, Mail, Shield, Heart, Activity, Flower2, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { UserProfile } from "@/App";

interface PartnerProps {
  profile: UserProfile;
  onProfileUpdate: (p: UserProfile) => void;
}

export default function Partner({ profile, onProfileUpdate }: PartnerProps) {
  const { data: syncSettings, isLoading } = useGetPartnerSync();
  const updateSync = useUpdatePartnerSync();

  const [email, setEmail] = useState(syncSettings?.partnerEmail || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleToggle = (field: "enabled" | "sharePhase" | "shareSymptoms" | "shareMood", value: boolean) => {
    updateSync.mutate({ data: { [field]: value } });
  };

  const handleSaveEmail = () => {
    updateSync.mutate({ data: { partnerEmail: email } });
    setIsEditing(false);
  };

  const handlePcosToggle = (value: boolean) => {
    onProfileUpdate({ ...profile, hasPcos: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-4 border-t-primary border-secondary/40 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10 max-w-2xl"
    >
      <header>
        <h1 className="text-3xl font-bold font-serif mb-1" style={{ color: "#674D66" }}>Partner Sync & Settings</h1>
        <p className="text-muted-foreground">Share your cycle data safely, and manage your personalisation preferences.</p>
      </header>

      {/* PCOS Settings */}
      <div className="bg-white rounded-3xl border p-6 shadow-sm" style={{ borderColor: "#EBD6DC" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl text-white" style={{ background: "#674D66" }}><Settings size={18} /></div>
          <div>
            <h2 className="font-bold text-base" style={{ color: "#674D66" }}>Health Profile Settings</h2>
            <p className="text-xs text-muted-foreground">Update your personalisation preferences</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: "#FAF4F7" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EBD6DC" }}>
              <Flower2 size={18} style={{ color: "#674D66" }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "#674D66" }}>PCOS/PMOS Mode</p>
              <p className="text-xs text-muted-foreground">Personalises dashboard, nutrition, and insights for PCOS</p>
            </div>
          </div>
          <Switch
            checked={profile.hasPcos}
            onCheckedChange={handlePcosToggle}
          />
        </div>

        {profile.hasPcos && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 px-4 py-3 rounded-2xl text-sm"
            style={{ background: "#EBD6DC", color: "#674D66" }}
          >
            🌸 PCOS mode is active. Your dashboard shows the PCOS hub, insulin-safe nutrition, and weight tracking.
          </motion.div>
        )}
      </div>

      {/* Partner Sync Toggle */}
      <div className="bg-white rounded-3xl border p-6 shadow-sm" style={{ borderColor: "#EBD6DC" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl text-white" style={{ background: "#9B7A9A" }}><Users size={18} /></div>
          <div>
            <h2 className="font-bold text-base" style={{ color: "#674D66" }}>Partner Sync</h2>
            <p className="text-xs text-muted-foreground">Let a partner or doctor see selected cycle data</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-semibold text-sm">Enable Partner Sync</p>
            <p className="text-xs text-muted-foreground mt-0.5">Your partner receives a daily cycle summary</p>
          </div>
          <Switch
            checked={syncSettings?.enabled ?? false}
            onCheckedChange={(v) => handleToggle("enabled", v)}
          />
        </div>

        {syncSettings?.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4"
          >
            <div className="h-px" style={{ background: "#EBD6DC" }} />

            {[
              { field: "sharePhase" as const, icon: <Flower2 size={16} />, label: "Share Cycle Phase", desc: "Current phase (menstrual, follicular, etc.)" },
              { field: "shareSymptoms" as const, icon: <Activity size={16} />, label: "Share Symptoms", desc: "Logged symptoms and severity" },
              { field: "shareMood" as const, icon: <Heart size={16} />, label: "Share Mood", desc: "Daily mood and energy levels" },
            ].map(item => (
              <div key={item.field} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EBD6DC", color: "#674D66" }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={syncSettings?.[item.field] ?? false}
                  onCheckedChange={(v) => handleToggle(item.field, v)}
                />
              </div>
            ))}

            <div className="h-px" style={{ background: "#EBD6DC" }} />

            {/* Email */}
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: "#674D66" }}>
                <Mail size={14} className="inline mr-1" /> Partner / Doctor Email
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="partner@example.com"
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 text-sm focus:outline-none"
                    style={{ borderColor: "#674D66" }}
                  />
                  <button onClick={handleSaveEmail} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "#674D66" }}>Save</button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold border-2" style={{ borderColor: "#EBD6DC", color: "#674D66" }}>Cancel</button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#FAF4F7" }}>
                  <span className="text-sm text-muted-foreground">{syncSettings?.partnerEmail || "Not set"}</span>
                  <button onClick={() => setIsEditing(true)} className="text-xs font-semibold" style={{ color: "#674D66" }}>Edit</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Sync Summary Preview */}
      {syncSettings?.enabled && (
        <div className="bg-white rounded-3xl border p-6 shadow-sm" style={{ borderColor: "#EBD6DC" }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} style={{ color: "#674D66" }} />
            <h3 className="font-bold text-sm" style={{ color: "#674D66" }}>Preview — What Your Partner Sees</h3>
          </div>
          <div className="rounded-2xl p-4 space-y-3 text-sm" style={{ background: "#FAF4F7" }}>
            <div className="flex justify-between">
              <span className="text-muted-foreground">From</span>
              <span className="font-semibold">{profile.name}'s Glo</span>
            </div>
            {syncSettings.sharePhase && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cycle Phase</span>
                <span className="font-semibold capitalize" style={{ color: "#674D66" }}>Luteal phase — day 29</span>
              </div>
            )}
            {syncSettings.shareSymptoms && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Today's Symptoms</span>
                <span className="font-semibold">Cramps (4/10), Fatigue</span>
              </div>
            )}
            {syncSettings.shareMood && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mood & Energy</span>
                <span className="font-semibold">Calm · 6/10 energy</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t" style={{ borderColor: "#EBD6DC" }}>
              <span className="text-muted-foreground text-xs">Shared via Glo — private & secure</span>
            </div>
          </div>

          <button
            className="mt-4 w-full py-3 rounded-2xl font-semibold text-sm text-white hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #674D66, #9B7A9A)" }}
            onClick={() => {
              const msg = `Hey! ${profile.name} shared their Glo summary with you via the Glo app.`;
              navigator.clipboard?.writeText(msg).catch(() => {});
              alert("Summary link copied to clipboard! (In production, this would send an email.)");
            }}
          >
            Share Summary Now
          </button>
        </div>
      )}
    </motion.div>
  );
}
