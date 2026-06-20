import { useState } from "react";
import { motion } from "framer-motion";
import { useGetSymptoms, useLogSymptom, useGetMoods, useLogMood } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Check, Plus } from "lucide-react";

const MOODS = [
  { id: "happy", emoji: "😊", label: "Happy" },
  { id: "calm", emoji: "😌", label: "Calm" },
  { id: "energised", emoji: "⚡️", label: "Energised" },
  { id: "sad", emoji: "😢", label: "Sad" },
  { id: "anxious", emoji: "😰", label: "Anxious" },
  { id: "irritable", emoji: "😠", label: "Irritable" },
  { id: "tired", emoji: "😴", label: "Tired" },
  { id: "bloated", emoji: "🎈", label: "Bloated" }
];

const SYMPTOM_CATEGORIES = [
  { name: "Cramps", id: "cramps" },
  { name: "Headache", id: "headache" },
  { name: "Bloating", id: "bloating" },
  { name: "Fatigue", id: "fatigue" },
  { name: "Acne", id: "acne" },
  { name: "Backache", id: "backache" },
  { name: "Tender Breasts", id: "tender_breasts" },
  { name: "Cravings", id: "cravings" }
];

export default function Symptoms() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number>(50);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  
  const { data: moods } = useGetMoods();
  const { data: symptoms } = useGetSymptoms();
  const logMood = useLogMood();
  const logSymptom = useLogSymptom();

  const handleMoodSubmit = () => {
    if (!selectedMood) return;
    logMood.mutate({
      data: {
        date: format(new Date(), "yyyy-MM-dd"),
        mood: selectedMood as any,
        energy: energyLevel
      }
    });
    // Optional: show toast
  };

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSymptomSubmit = () => {
    selectedSymptoms.forEach(s => {
      logSymptom.mutate({
        data: {
          date: format(new Date(), "yyyy-MM-dd"),
          name: s,
          severity: 3, // Default severity
          category: s
        }
      });
    });
    setSelectedSymptoms([]);
    // Optional: show toast
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-serif">How are you feeling?</h1>
        <p className="text-muted-foreground text-lg">Log your mood, energy, and physical symptoms to find patterns.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mood Logger */}
        <div className="bg-card rounded-3xl p-8 shadow-sm border space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 font-serif">Today's Mood</h2>
            <div className="grid grid-cols-4 gap-4">
              {MOODS.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${
                    selectedMood === mood.id 
                      ? "bg-primary text-white scale-105 shadow-md" 
                      : "bg-secondary/30 hover:bg-secondary text-foreground"
                  }`}
                >
                  <span className="text-3xl mb-2">{mood.emoji}</span>
                  <span className={`text-xs font-medium ${selectedMood === mood.id ? "text-white" : "text-muted-foreground"}`}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Energy Level</h3>
              <span className="text-sm font-bold text-primary">{energyLevel}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" 
            />
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Exhausted</span>
              <span>Buzzing</span>
            </div>
          </div>

          <button 
            onClick={handleMoodSubmit}
            disabled={!selectedMood || logMood.isPending}
            className="w-full py-4 rounded-full bg-foreground text-background font-bold hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {logMood.isPending ? "Saving..." : "Save Mood & Energy"}
          </button>
        </div>

        {/* Symptoms Logger */}
        <div className="bg-card rounded-3xl p-8 shadow-sm border space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 font-serif">Physical Symptoms</h2>
            <div className="flex flex-wrap gap-3">
              {SYMPTOM_CATEGORIES.map(sym => {
                const isSelected = selectedSymptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    onClick={() => toggleSymptom(sym.id)}
                    className={`px-5 py-3 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      isSelected 
                        ? "bg-primary text-white shadow-md border-transparent" 
                        : "bg-background border border-border text-foreground hover:border-primary/50"
                    }`}
                  >
                    {isSelected && <Check size={16} />}
                    {sym.name}
                  </button>
                );
              })}
              <button className="px-5 py-3 rounded-full text-sm font-medium border border-dashed border-muted-foreground/50 text-muted-foreground hover:bg-secondary/50 transition-all flex items-center gap-2">
                <Plus size={16} />
                Custom
              </button>
            </div>
          </div>

          <div className="bg-secondary/30 rounded-2xl p-6">
            <h3 className="font-semibold mb-2">Why log symptoms?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tracking your physical symptoms helps Glo predict future patterns. For example, if you consistently get headaches on day 24 of your cycle, we can warn you next month.
            </p>
          </div>

          <button 
            onClick={handleSymptomSubmit}
            disabled={selectedSymptoms.length === 0 || logSymptom.isPending}
            className="w-full py-4 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-auto"
          >
            {logSymptom.isPending ? "Saving..." : `Log ${selectedSymptoms.length} Symptoms`}
          </button>
        </div>
      </div>
      
      {/* Recent History */}
      <div className="pt-8">
        <h2 className="text-xl font-bold mb-4 font-serif">Recent Logs</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[200px] bg-white dark:bg-card border rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">
                {format(new Date(Date.now() - i * 86400000), "MMM d")}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">😌</span>
                <div>
                  <p className="font-bold text-foreground">Calm</p>
                  <p className="text-xs text-muted-foreground">Energy: 60%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
