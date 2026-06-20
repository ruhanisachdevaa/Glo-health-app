import { useState, useEffect } from "react";
import {
  useGetDashboardStats,
  useGetCycleSummary,
  useGetDailyAffirmation
} from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Heart,
  Droplet,
  Activity,
  Flame,
  Sparkles,
  Plus,
  Scale,
  Flower2,
  Brain,
  Apple
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UserProfile } from "@/App";
import { useLocation } from "wouter";

const PHASE_COLORS: Record<string, string> = {
  menstrual: "#C0647A",
  follicular: "#9B7A9A",
  ovulation: "#674D66",
  luteal: "#7A5C7A",
};

const PCOS_TIPS: Record<string, string[]> = {
  menstrual: [
    "Anti-inflammatory foods like ginger and turmeric can help reduce PCOS-related cramps.",
    "Light yoga or walking is ideal today — avoid high-intensity to give your body rest.",
    "Track your flow consistency — irregular PCOS periods often show spotting patterns."
  ],
  follicular: [
    "Rising oestrogen in your follicular phase may temporarily improve insulin sensitivity.",
    "Great week to increase strength training — your body responds better to muscle building now.",
    "Eat more cruciferous vegetables to support oestrogen metabolism and liver detox."
  ],
  ovulation: [
    "PCOS can cause delayed or absent ovulation — peak LH may come later than expected.",
    "Zinc-rich foods (pumpkin seeds, oysters) support ovulation in PCOS cycles.",
    "If trying to conceive, ovulation testing with OPKs gives more accurate results than calendar alone."
  ],
  luteal: [
    "Progesterone dips sharper with PCOS — PMS/PMDD symptoms may be more intense.",
    "Magnesium (300–400mg daily) significantly reduces luteal phase anxiety and bloating in PCOS.",
    "Avoid refined carbs and sugar this week to prevent blood sugar spikes that worsen mood swings."
  ],
};

interface DashboardProps {
  profile: UserProfile;
}

export default function Dashboard({ profile }: DashboardProps) {
  const { data: stats } = useGetDashboardStats();
  const { data: cycle, isLoading: cycleLoading } = useGetCycleSummary();
  const { data: affirmation, isLoading: affirmationLoading } = useGetDailyAffirmation();
  const [showGreeting, setShowGreeting] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const hasSeenGreeting = sessionStorage.getItem("hasSeenGreeting");
    if (!hasSeenGreeting && !affirmationLoading && affirmation) {
      setShowGreeting(true);
      sessionStorage.setItem("hasSeenGreeting", "true");
    }
  }, [affirmation, affirmationLoading]);

  const today = format(new Date(), "EEEE, do MMMM");
  const phase = cycle?.currentPhase || "follicular";
  const phaseColor = PHASE_COLORS[phase] || "#674D66";
  const pcosTip = PCOS_TIPS[phase]?.[Math.floor(Math.random() * 3)] || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      {/* Greeting Modal */}
      <Dialog open={showGreeting} onOpenChange={setShowGreeting}>
        <DialogContent className="sm:max-w-md border rounded-3xl p-8" style={{ background: "linear-gradient(135deg, hsl(343,35%,97%) 0%, hsl(302,15%,93%) 100%)", borderColor: "#EBD6DC" }}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-serif flex flex-col items-center gap-4" style={{ color: "#674D66" }}>
              <span className="text-4xl">{affirmation?.emoji || "✨"}</span>
              Good Morning, {profile.name}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-5 py-2">
            <p className="text-lg font-medium leading-relaxed text-foreground">
              "{affirmation?.text}"
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              Today's {affirmation?.type}
            </p>
            {profile.hasPcos && (
              <div className="text-left p-4 rounded-2xl text-sm" style={{ background: "#EBD6DC", color: "#674D66" }}>
                <p className="font-semibold mb-1">🌸 Your PCOS tip for today</p>
                <p className="leading-relaxed opacity-90">{pcosTip}</p>
              </div>
            )}
            <button
              onClick={() => setShowGreeting(false)}
              className="w-full rounded-full px-8 py-3 font-semibold text-white hover:opacity-90 transition-opacity shadow-sm"
              style={{ background: "linear-gradient(135deg, #674D66, #9B7A9A)" }}
            >
              Start My Day
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#674D66" }}>{today}</p>
        <h1 className="text-4xl font-bold tracking-tight font-serif text-foreground">Welcome back, {profile.name}</h1>
        <p className="text-muted-foreground text-lg">Your body is in its <span className="font-semibold capitalize" style={{ color: phaseColor }}>{phase}</span> phase today.</p>
        {profile.hasPcos && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "#EBD6DC", color: "#674D66" }}>
            <Flower2 size={12} /> PCOS Dashboard Active
          </div>
        )}
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Cycle Ring */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-3xl p-7 shadow-sm border relative overflow-hidden" style={{ borderColor: "#EBD6DC" }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" style={{ background: `${phaseColor}12` }} />
          <h2 className="text-base font-semibold mb-5 uppercase tracking-wide text-muted-foreground">Current Cycle</h2>
          {cycleLoading ? (
            <div className="h-56 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-4 border-t-primary border-secondary/40 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-center gap-10">
              <div className="relative w-52 h-52 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="9" className="text-secondary/40" />
                  <circle
                    cx="50" cy="50" r="44"
                    fill="none" strokeWidth="9"
                    stroke={phaseColor}
                    strokeDasharray="276"
                    strokeDashoffset={276 - (276 * ((cycle?.cycleDay || 1) / (cycle?.avgCycleLength || 28)))}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Day</span>
                  <span className="text-5xl font-serif font-bold text-foreground">{cycle?.cycleDay || 14}</span>
                  <span className="text-xs font-semibold mt-1 capitalize" style={{ color: phaseColor }}>{phase}</span>
                </div>
              </div>

              <div className="space-y-5 flex-1 max-w-sm">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Next Period In</h3>
                  <p className="text-3xl font-bold text-foreground">{cycle?.daysUntilNextPeriod ?? 14} <span className="text-base text-muted-foreground font-normal">days</span></p>
                </div>
                {cycle?.fertilityWindow && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Fertility Window</h3>
                    <p className="text-base font-semibold flex items-center gap-2 text-foreground">
                      <Sparkles size={16} style={{ color: "#9B7A9A" }} />
                      {cycle.fertilityWindow}
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">{cycle?.phaseDescription}</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Column */}
        <div className="space-y-3">
          <div className="rounded-3xl p-5 shadow-sm border" style={{ background: "#F5EBF0", borderColor: "#EBD6DC" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl text-white" style={{ background: "#674D66" }}><Flame size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Streak</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.loggingStreak || 0} <span className="text-sm text-muted-foreground font-normal">days</span></p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border" style={{ borderColor: "#EBD6DC" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl text-white" style={{ background: "#9B7A9A" }}><Activity size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avg Cycle</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.avgCycleLength || 28} <span className="text-sm text-muted-foreground font-normal">days</span></p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border" style={{ borderColor: "#EBD6DC" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl text-white" style={{ background: "#B890B0" }}><Heart size={18} /></div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top Mood</h3>
            </div>
            <p className="text-3xl font-bold text-foreground capitalize">{stats?.dominantMood || "Calm"}</p>
          </div>
        </div>
      </div>

      {/* PCOS Hub Section */}
      {profile.hasPcos && (
        <div className="bg-white rounded-3xl border p-6 shadow-sm" style={{ borderColor: "#EBD6DC" }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #674D66, #9B7A9A)" }}>
              <Flower2 size={16} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: "#674D66" }}>Your PCOS Hub</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setLocation("/lifestyle")}
              className="flex flex-col items-start gap-2 p-4 rounded-2xl border-2 hover:shadow-sm transition-all text-left"
              style={{ borderColor: "#EBD6DC", background: "#FAF4F7" }}
            >
              <Apple size={22} style={{ color: "#674D66" }} />
              <p className="font-semibold text-sm" style={{ color: "#674D66" }}>Insulin-Safe Nutrition</p>
              <p className="text-xs text-muted-foreground">Phase-adapted, PCOS-friendly meal ideas</p>
            </button>
            <button
              onClick={() => setLocation("/health-patterns")}
              className="flex flex-col items-start gap-2 p-4 rounded-2xl border-2 hover:shadow-sm transition-all text-left"
              style={{ borderColor: "#EBD6DC", background: "#FAF4F7" }}
            >
              <Brain size={22} style={{ color: "#9B7A9A" }} />
              <p className="font-semibold text-sm" style={{ color: "#674D66" }}>Pattern Correlations</p>
              <p className="text-xs text-muted-foreground">Spot symptom triggers and trends</p>
            </button>
            <button
              onClick={() => setLocation("/health-patterns")}
              className="flex flex-col items-start gap-2 p-4 rounded-2xl border-2 hover:shadow-sm transition-all text-left"
              style={{ borderColor: "#EBD6DC", background: "#FAF4F7" }}
            >
              <Scale size={22} style={{ color: "#B890B0" }} />
              <p className="font-semibold text-sm" style={{ color: "#674D66" }}>Weight Tracking</p>
              <p className="text-xs text-muted-foreground">Monitor weight alongside your cycle</p>
            </button>
          </div>

          <div className="mt-4 p-4 rounded-2xl text-sm leading-relaxed" style={{ background: "#EBD6DC", color: "#674D66" }}>
            <p className="font-semibold mb-1">💡 Today's PCOS Insight — {phase.charAt(0).toUpperCase() + phase.slice(1)} Phase</p>
            <p className="opacity-90">{pcosTip}</p>
          </div>
        </div>
      )}

      {/* Quick Log Strip */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Log Today</h2>
          <button className="text-sm font-semibold hover:underline" style={{ color: "#674D66" }}>View all</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Period", icon: <Droplet size={22} />, bg: "#FEE2E2", color: "#DC2626", href: "/tracker" },
            { label: "Mood", icon: <Heart size={22} />, bg: "#EBD6DC", color: "#674D66", href: "/symptoms" },
            { label: "Symptoms", icon: <Activity size={22} />, bg: "#F5EBF0", color: "#9B7A9A", href: "/symptoms" },
            { label: profile.hasPcos ? "Weight" : "Custom", icon: profile.hasPcos ? <Scale size={22} /> : <Plus size={22} />, bg: "#F3E8F3", color: "#674D66", href: profile.hasPcos ? "/health-patterns" : "/" },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => setLocation(item.href)}
              className="bg-white border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all group"
              style={{ borderColor: "#EBD6DC" }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: item.bg, color: item.color }}>
                {item.icon}
              </div>
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cycle stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Cycles Tracked", value: stats?.cycleCount || 0, suffix: "cycles" },
          { label: "Symptoms This Month", value: stats?.symptomsThisMonth || 0, suffix: "logged" },
          { label: "Zen Points", value: stats?.totalPoints || 0, suffix: "pts" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border p-4 text-center shadow-sm" style={{ borderColor: "#EBD6DC" }}>
            <p className="text-2xl font-bold" style={{ color: "#674D66" }}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
