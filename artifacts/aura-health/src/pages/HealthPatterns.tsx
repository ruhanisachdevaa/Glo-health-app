import { useState } from "react";
import { motion } from "framer-motion";
import { useGetWeightEntries, useLogWeight, useGetCorrelationInsights, useGetMoods, useGetSymptoms } from "@workspace/api-client-react";
import { TrendingUp, Brain, Scale, Plus, CheckCircle, AlertCircle, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { format, parseISO } from "date-fns";

export default function HealthPatterns() {
  const { data: weightEntries = [], refetch: refetchWeight } = useGetWeightEntries();
  const { data: correlations = [], isLoading: correlationsLoading } = useGetCorrelationInsights();
  const { data: moods = [] } = useGetMoods();
  const { data: symptoms = [] } = useGetSymptoms();
  const logWeight = useLogWeight();

  const [showWeightForm, setShowWeightForm] = useState(false);
  const [weightKg, setWeightKg] = useState("");
  const [weightNotes, setWeightNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"insights" | "weight" | "mood">("insights");

  const handleLogWeight = () => {
    const kg = parseFloat(weightKg);
    if (isNaN(kg) || kg < 20 || kg > 300) return;
    logWeight.mutate(
      { data: { date: new Date().toISOString().split("T")[0], weightKg: kg, notes: weightNotes || null } },
      { onSuccess: () => { setShowWeightForm(false); setWeightKg(""); setWeightNotes(""); refetchWeight(); } }
    );
  };

  const weightChartData = [...weightEntries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map(e => ({ date: format(parseISO(e.date), "dd MMM"), weight: e.weightKg }));

  const moodChartData = [...moods]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map(m => ({
      date: format(parseISO(m.date), "dd MMM"),
      energy: m.energy,
      mood: m.mood,
    }));

  const symptomFrequency = symptoms.reduce<Record<string, number>>((acc, s) => {
    acc[s.name] = (acc[s.name] || 0) + 1;
    return acc;
  }, {});
  const topSymptoms = Object.entries(symptomFrequency).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const confidenceColor = (c: string) =>
    c === "high" ? "#674D66" : c === "medium" ? "#9B7A9A" : "#C4A8C0";
  const confidenceIcon = (c: string) =>
    c === "high" ? CheckCircle : c === "medium" ? AlertCircle : Info;

  const tabs = [
    { id: "insights", label: "Correlations", icon: Brain },
    { id: "weight", label: "Weight", icon: Scale },
    { id: "mood", label: "Energy & Mood", icon: TrendingUp },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      <header>
        <h1 className="text-3xl font-bold font-serif mb-1" style={{ color: "#674D66" }}>Health Patterns</h1>
        <p className="text-muted-foreground">Rule-based insights from your logged data — no guesswork.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 bg-secondary/40 p-1 rounded-2xl">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={activeTab === tab.id
                ? { background: "#674D66", color: "white" }
                : { background: "transparent", color: "#674D66" }
              }
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Correlation Insights */}
      {activeTab === "insights" && (
        <div className="space-y-4">
          {correlationsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl border p-6 animate-pulse h-28" style={{ borderColor: "#EBD6DC" }} />
              ))}
            </div>
          ) : correlations.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Brain size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No insights yet — keep logging!</p>
            </div>
          ) : (
            correlations.map((insight, i) => {
              const Icon = confidenceIcon(insight.confidence);
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-3xl border p-6 shadow-sm"
                  style={{ borderColor: "#EBD6DC" }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#EBD6DC" }}>
                      <Icon size={20} style={{ color: confidenceColor(insight.confidence) }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-bold text-base" style={{ color: "#674D66" }}>{insight.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize" style={{ background: "#EBD6DC", color: "#674D66" }}>
                          {insight.confidence} confidence
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}

          {/* Symptom frequency */}
          {topSymptoms.length > 0 && (
            <div className="bg-white rounded-3xl border p-6 shadow-sm" style={{ borderColor: "#EBD6DC" }}>
              <h3 className="font-bold text-base mb-4" style={{ color: "#674D66" }}>Most Frequent Symptoms</h3>
              <div className="space-y-3">
                {topSymptoms.map(([name, count]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-32 truncate">{name}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden bg-secondary">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #674D66, #9B7A9A)" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / topSymptoms[0][1]) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium w-12 text-right">{count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weight Tracking */}
      {activeTab === "weight" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground font-medium">{weightEntries.length} entries logged</p>
            <button
              onClick={() => setShowWeightForm(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #674D66, #9B7A9A)" }}
            >
              <Plus size={16} /> Log Weight
            </button>
          </div>

          {showWeightForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-white rounded-3xl border p-6 shadow-sm space-y-4"
              style={{ borderColor: "#EBD6DC" }}
            >
              <h3 className="font-bold" style={{ color: "#674D66" }}>Log Today's Weight</h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={weightKg}
                  onChange={e => setWeightKg(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 text-sm focus:outline-none"
                  style={{ borderColor: "#EBD6DC" }}
                  step="0.1"
                />
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={weightNotes}
                  onChange={e => setWeightNotes(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 text-sm focus:outline-none"
                  style={{ borderColor: "#EBD6DC" }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWeightForm(false)}
                  className="flex-1 py-3 rounded-xl border-2 font-semibold text-sm"
                  style={{ borderColor: "#EBD6DC", color: "#674D66" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogWeight}
                  disabled={!weightKg || logWeight.isPending}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50"
                  style={{ background: "#674D66" }}
                >
                  {logWeight.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </motion.div>
          )}

          {weightChartData.length >= 2 ? (
            <div className="bg-white rounded-3xl border p-6 shadow-sm" style={{ borderColor: "#EBD6DC" }}>
              <h3 className="font-bold mb-4" style={{ color: "#674D66" }}>Weight Trend (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weightChartData}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#674D66" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#674D66" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBD6DC" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9B8A9A" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9B8A9A" }} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#EBD6DC" }} />
                  <Area type="monotone" dataKey="weight" stroke="#674D66" fill="url(#weightGrad)" strokeWidth={2} dot={{ fill: "#674D66", r: 3 }} name="Weight (kg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border" style={{ borderColor: "#EBD6DC" }}>
              <Scale size={40} className="mx-auto mb-3" style={{ color: "#EBD6DC" }} />
              <p className="font-medium" style={{ color: "#674D66" }}>Log at least 2 weight entries to see your trend chart.</p>
            </div>
          )}

          {weightEntries.length > 0 && (
            <div className="bg-white rounded-3xl border p-6 shadow-sm" style={{ borderColor: "#EBD6DC" }}>
              <h3 className="font-bold mb-4" style={{ color: "#674D66" }}>Recent Logs</h3>
              <div className="space-y-2">
                {weightEntries.slice(0, 10).map(entry => (
                  <div key={entry.id} className="flex justify-between items-center py-2 border-b last:border-0 text-sm" style={{ borderColor: "#EBD6DC" }}>
                    <span className="text-muted-foreground">{format(parseISO(entry.date), "EEE, dd MMM")}</span>
                    <span className="font-bold" style={{ color: "#674D66" }}>{entry.weightKg} kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Energy & Mood Chart */}
      {activeTab === "mood" && (
        <div className="space-y-4">
          {moodChartData.length >= 2 ? (
            <div className="bg-white rounded-3xl border p-6 shadow-sm" style={{ borderColor: "#EBD6DC" }}>
              <h3 className="font-bold mb-4" style={{ color: "#674D66" }}>Energy Level — Last 14 Days</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={moodChartData}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9B7A9A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#9B7A9A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBD6DC" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9B8A9A" }} />
                  <YAxis domain={[1, 10]} tick={{ fontSize: 11, fill: "#9B8A9A" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#EBD6DC" }} />
                  <Area type="monotone" dataKey="energy" stroke="#9B7A9A" fill="url(#energyGrad)" strokeWidth={2} dot={{ fill: "#9B7A9A", r: 3 }} name="Energy (1–10)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border" style={{ borderColor: "#EBD6DC" }}>
              <TrendingUp size={40} className="mx-auto mb-3" style={{ color: "#EBD6DC" }} />
              <p className="font-medium" style={{ color: "#674D66" }}>Log your mood for at least 2 days to see your energy trend.</p>
            </div>
          )}

          <div className="bg-white rounded-3xl border p-6 shadow-sm" style={{ borderColor: "#EBD6DC" }}>
            <h3 className="font-bold mb-4" style={{ color: "#674D66" }}>Recent Mood Log</h3>
            {moods.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No moods logged yet. Head to Symptoms &amp; Mood to start.</p>
            ) : (
              <div className="space-y-2">
                {moods.slice(0, 14).map(m => {
                  const emojiMap: Record<string, string> = {
                    happy: "😊", calm: "😌", anxious: "😰", sad: "😢",
                    irritable: "😤", energised: "⚡", tired: "😴", bloated: "🫧"
                  };
                  return (
                    <div key={m.id} className="flex justify-between items-center py-2 border-b last:border-0 text-sm" style={{ borderColor: "#EBD6DC" }}>
                      <div className="flex items-center gap-2">
                        <span>{emojiMap[m.mood] || "💜"}</span>
                        <span className="font-medium capitalize">{m.mood}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="w-1.5 h-3 rounded-full" style={{ background: i < m.energy ? "#674D66" : "#EBD6DC" }} />
                          ))}
                        </div>
                        <span className="text-muted-foreground text-xs w-16 text-right">{format(parseISO(m.date), "dd MMM")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
