import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSaveQuestionnaireResponse } from "@workspace/api-client-react";
import { Check, ChevronRight, X, Printer, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface Question {
  id: string;
  title: string;
  subtitle?: string;
  options: { label: string; nextId: string | null; tag?: string }[];
}

const QUESTION_TREE: Record<string, Question> = {
  q_start: {
    id: "q_start",
    title: "How regular is your menstrual cycle?",
    subtitle: "This helps us tailor your tracking experience.",
    options: [
      { label: "Very regular (like clockwork)", nextId: "q_cycle_length_regular", tag: "regular" },
      { label: "Somewhat regular", nextId: "q_cycle_length_regular", tag: "somewhat_regular" },
      { label: "Irregular — it varies a lot", nextId: "q_irregular_range", tag: "irregular" },
      { label: "I don't track it yet", nextId: "q_main_concern", tag: "no_track" },
    ]
  },
  q_cycle_length_regular: {
    id: "q_cycle_length_regular",
    title: "What is your typical cycle length?",
    subtitle: "Count from the first day of one period to the first day of the next.",
    options: [
      { label: "21–25 days (shorter)", nextId: "q_symptoms", tag: "short_cycle" },
      { label: "26–30 days (typical)", nextId: "q_symptoms", tag: "typical_cycle" },
      { label: "31–35 days (longer)", nextId: "q_symptoms", tag: "long_cycle" },
      { label: "I'm not sure", nextId: "q_symptoms", tag: "unknown_length" },
    ]
  },
  q_irregular_range: {
    id: "q_irregular_range",
    title: "How irregular are your periods?",
    subtitle: "Irregular cycles can have many causes — let's understand yours.",
    options: [
      { label: "They come early (less than 21 days apart)", nextId: "q_pcos_symptoms", tag: "short_irregular" },
      { label: "They come very late (35+ days apart)", nextId: "q_pcos_symptoms", tag: "long_irregular" },
      { label: "They skip months entirely", nextId: "q_pcos_symptoms", tag: "skips" },
      { label: "Timing is unpredictable", nextId: "q_pcos_symptoms", tag: "unpredictable" },
    ]
  },
  q_pcos_symptoms: {
    id: "q_pcos_symptoms",
    title: "Do you experience any of these alongside irregular periods?",
    subtitle: "These symptoms can help identify PCOS or hormonal imbalances.",
    options: [
      { label: "Excess hair growth or acne", nextId: "q_symptoms", tag: "pcos_indicator" },
      { label: "Weight gain or difficulty losing weight", nextId: "q_symptoms", tag: "insulin_resistance" },
      { label: "Hair thinning or loss", nextId: "q_symptoms", tag: "androgenic" },
      { label: "None of these", nextId: "q_symptoms", tag: "no_pcos_signs" },
    ]
  },
  q_symptoms: {
    id: "q_symptoms",
    title: "What are your most troublesome menstrual symptoms?",
    subtitle: "Select the one that affects you most.",
    options: [
      { label: "Cramps and physical pain", nextId: "q_pain_severity", tag: "pain" },
      { label: "Fatigue and low energy", nextId: "q_fatigue_sleep", tag: "fatigue" },
      { label: "Mood swings and emotional changes", nextId: "q_mood_severity", tag: "mood" },
      { label: "Bloating and digestive issues", nextId: "q_goals", tag: "digestive" },
    ]
  },
  q_pain_severity: {
    id: "q_pain_severity",
    title: "How would you rate your cramp pain on a typical period?",
    subtitle: "Understanding severity helps us recommend the right support.",
    options: [
      { label: "Mild — manageable without medication", nextId: "q_goals", tag: "pain_mild" },
      { label: "Moderate — I often take painkillers", nextId: "q_goals", tag: "pain_moderate" },
      { label: "Severe — it disrupts my daily life", nextId: "q_goals", tag: "pain_severe" },
      { label: "Extreme — I've had to go to A&E", nextId: "q_goals", tag: "pain_extreme" },
    ]
  },
  q_fatigue_sleep: {
    id: "q_fatigue_sleep",
    title: "How is your sleep quality around your period?",
    subtitle: "Sleep disruption and fatigue are closely linked in the luteal phase.",
    options: [
      { label: "I sleep well throughout", nextId: "q_goals", tag: "sleep_good" },
      { label: "I struggle to fall asleep", nextId: "q_goals", tag: "sleep_onset" },
      { label: "I wake up during the night", nextId: "q_goals", tag: "sleep_wake" },
      { label: "I sleep too much but feel exhausted", nextId: "q_goals", tag: "sleep_excess" },
    ]
  },
  q_mood_severity: {
    id: "q_mood_severity",
    title: "How much do your mood changes impact your daily life?",
    subtitle: "Severe mood changes before your period may indicate PMDD.",
    options: [
      { label: "Mild — I notice slight irritability", nextId: "q_goals", tag: "mood_mild" },
      { label: "Moderate — relationships are affected", nextId: "q_goals", tag: "mood_moderate" },
      { label: "Severe — I struggle to function normally", nextId: "q_goals", tag: "mood_severe_pmdd" },
      { label: "It varies each cycle", nextId: "q_goals", tag: "mood_variable" },
    ]
  },
  q_main_concern: {
    id: "q_main_concern",
    title: "What brings you to Glo?",
    subtitle: "We'll focus your dashboard on what matters most to you.",
    options: [
      { label: "I want to understand my cycle better", nextId: "q_symptoms", tag: "awareness" },
      { label: "I'm trying to conceive", nextId: "q_goals", tag: "fertility" },
      { label: "Managing PCOS or hormonal conditions", nextId: "q_pcos_symptoms", tag: "pcos_management" },
      { label: "General wellness and health tracking", nextId: "q_goals", tag: "wellness" },
    ]
  },
  q_goals: {
    id: "q_goals",
    title: "What's your main goal with Glo?",
    subtitle: "This is the final step — we'll personalise everything based on your answers.",
    options: [
      { label: "Track my periods and predict them accurately", nextId: null, tag: "goal_track" },
      { label: "Manage symptoms naturally", nextId: null, tag: "goal_symptoms" },
      { label: "Understand my hormonal health better", nextId: null, tag: "goal_hormones" },
      { label: "Plan for pregnancy or avoid it", nextId: null, tag: "goal_fertility" },
    ]
  }
};

interface Answer {
  questionId: string;
  questionTitle: string;
  answer: string;
  tag: string;
}

function generateSummary(answers: Answer[]): { headline: string; insights: string[]; recommendations: string[] } {
  const tags = answers.map(a => a.tag);
  const insights: string[] = [];
  const recommendations: string[] = [];

  if (tags.includes("irregular") || tags.includes("skips") || tags.includes("long_irregular")) {
    insights.push("Your cycle irregularity may benefit from specialist evaluation, especially if it has been ongoing for more than 3 months.");
    recommendations.push("Log your period start and end dates daily in the Cycle Tracker");
    recommendations.push("Consider speaking to a GP or gynaecologist about cycle regulation");
  }

  if (tags.includes("pcos_indicator") || tags.includes("insulin_resistance") || tags.includes("androgenic")) {
    insights.push("Some of your symptoms align with PCOS indicators. This is manageable with the right lifestyle adjustments and medical support.");
    recommendations.push("Enable the PCOS Hub in your dashboard settings for tailored insights");
    recommendations.push("Explore the insulin-safe nutrition section in your Lifestyle Hub");
  }

  if (tags.includes("pain_severe") || tags.includes("pain_extreme")) {
    insights.push("Your pain levels are significant. Severe cramping that disrupts daily life should be evaluated — it may indicate endometriosis or adenomyosis.");
    recommendations.push("Use heat patches (available in the Glo Shop) for immediate relief");
    recommendations.push("Track your pain severity in the Symptoms log to bring data to your GP");
  }

  if (tags.includes("mood_severe_pmdd")) {
    insights.push("Your mood changes sound consistent with PMDD (Premenstrual Dysphoric Disorder). This is a real, treatable medical condition — you're not alone.");
    recommendations.push("Read the PMDD resources in your Mind Space section");
    recommendations.push("Speak to your GP about SSRI options or hormonal treatments for PMDD");
  }

  if (tags.includes("sleep_wake") || tags.includes("sleep_onset") || tags.includes("sleep_excess")) {
    insights.push("Luteal phase sleep disruption is very common due to progesterone shifts. It's directly tied to daytime fatigue.");
    recommendations.push("Try magnesium glycinate (400mg) before bed in your luteal phase");
    recommendations.push("Explore the sleep tips in your Mind Space resources");
  }

  if (tags.includes("fatigue") && (tags.includes("pain") || tags.includes("mood"))) {
    insights.push("You're managing multiple overlapping symptoms. Prioritising iron-rich foods and gentle cycle-phase exercise may reduce your overall burden.");
  }

  if (tags.includes("goal_fertility")) {
    insights.push("For fertility planning, tracking ovulation signs alongside your cycle in the Tracker will give you the most accurate fertile window predictions.");
    recommendations.push("Enable ovulation tracking in your Cycle Tracker");
    recommendations.push("Explore the follicular phase nutrition guide for fertility-supporting foods");
  }

  if (insights.length === 0) {
    insights.push("Your cycle sounds relatively well-managed. Consistent tracking will reveal patterns over time and help you stay ahead of symptoms.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Log your mood and symptoms daily for at least 2 weeks");
    recommendations.push("Explore the Lifestyle Hub for phase-adapted workouts and nutrition");
  }

  const hasIrregular = tags.some(t => ["irregular", "skips", "pcos_indicator", "insulin_resistance"].includes(t));
  const hasSevere = tags.some(t => ["pain_severe", "pain_extreme", "mood_severe_pmdd"].includes(t));

  let headline = "Your Glo Profile";
  if (hasIrregular && hasSevere) headline = "Complex Cycle Profile — You Deserve Specialist Support";
  else if (hasIrregular) headline = "Irregular Cycle Profile — Let's Bring Balance";
  else if (hasSevere) headline = "High-Impact Symptoms Profile — Relief is Possible";
  else headline = "Wellness-Focused Profile — Keep Thriving";

  return { headline, insights, recommendations };
}

export default function Assessment() {
  const [currentId, setCurrentId] = useState("q_start");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [direction, setDirection] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [, setLocation] = useLocation();
  const printRef = useRef<HTMLDivElement>(null);

  const saveResponse = useSaveQuestionnaireResponse();

  const history = answers.map(a => a.questionId);
  const progress = isComplete ? 100 : Math.min(95, (answers.length / 8) * 100);

  const handleAnswer = (option: { label: string; nextId: string | null; tag?: string }) => {
    const currentQ = QUESTION_TREE[currentId];
    const newAnswer: Answer = {
      questionId: currentId,
      questionTitle: currentQ.title,
      answer: option.label,
      tag: option.tag ?? option.label,
    };

    saveResponse.mutate({ data: { questionId: currentId, answer: option.label } });
    setAnswers(prev => [...prev, newAnswer]);

    if (option.nextId) {
      setDirection(1);
      setCurrentId(option.nextId);
    } else {
      setIsComplete(true);
    }
  };

  const handleBack = () => {
    if (answers.length === 0) return;
    const prev = answers[answers.length - 1];
    setDirection(-1);
    setAnswers(a => a.slice(0, -1));
    setCurrentId(prev.questionId);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isComplete) {
    const summary = generateSummary(answers);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto space-y-6 pb-10"
      >
        {/* Print area */}
        <div ref={printRef}>
          <div className="rounded-3xl p-8 text-white" style={{ background: "linear-gradient(135deg, #674D66, #9B7A9A)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Check size={22} className="text-white" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Assessment Complete</p>
            </div>
            <h2 className="text-2xl font-bold font-serif">{summary.headline}</h2>
            <p className="text-white/70 text-sm mt-1">Based on {answers.length} personalised questions</p>
          </div>

          <div className="bg-white rounded-3xl border p-6 shadow-sm space-y-4" style={{ borderColor: "#EBD6DC" }}>
            <h3 className="font-bold text-lg" style={{ color: "#674D66" }}>Your Personal Insights</h3>
            {summary.insights.map((insight, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-2xl" style={{ background: "#F5EBF0" }}>
                <span className="text-lg flex-shrink-0">💜</span>
                <p className="text-sm leading-relaxed text-foreground">{insight}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl border p-6 shadow-sm space-y-3" style={{ borderColor: "#EBD6DC" }}>
            <h3 className="font-bold text-lg" style={{ color: "#674D66" }}>Recommended Next Steps</h3>
            {summary.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold mt-0.5" style={{ background: "#674D66" }}>{i + 1}</div>
                <p className="text-sm leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl border p-6 shadow-sm" style={{ borderColor: "#EBD6DC" }}>
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">Your Responses</h3>
            <div className="space-y-2">
              {answers.map((a, i) => (
                <div key={i} className="flex justify-between gap-4 text-sm py-2 border-b last:border-0" style={{ borderColor: "#EBD6DC" }}>
                  <span className="text-muted-foreground">{a.questionTitle}</span>
                  <span className="font-semibold text-right" style={{ color: "#674D66" }}>{a.answer}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold border-2 hover:bg-secondary/30 transition-colors"
            style={{ borderColor: "#EBD6DC", color: "#674D66" }}
          >
            <Printer size={18} /> Print / Save PDF
          </button>
          <button
            onClick={() => setLocation("/")}
            className="flex-1 py-4 rounded-2xl font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #674D66, #9B7A9A)" }}
          >
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  const currentQ = QUESTION_TREE[currentId];
  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0, scale: 0.92, rotate: d > 0 ? 4 : -4 }),
    center: { x: 0, opacity: 1, scale: 1, rotate: 0, zIndex: 1 },
    exit: (d: number) => ({ x: d < 0 ? 300 : -300, opacity: 0, scale: 0.92, rotate: d < 0 ? 4 : -4, zIndex: 0 }),
  };

  return (
    <div className="max-w-md mx-auto h-[85vh] flex flex-col py-6">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <button
            onClick={answers.length > 0 ? handleBack : () => setLocation("/")}
            className="hover:text-foreground flex items-center gap-1 transition-colors"
          >
            {answers.length > 0 ? <><ArrowLeft size={16} /> Back</> : <><X size={16} /> Exit</>}
          </button>
          <span style={{ color: "#674D66" }}>Question {answers.length + 1}</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #674D66, #9B7A9A)" }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        {currentQ.subtitle && (
          <p className="text-xs text-muted-foreground">{currentQ.subtitle}</p>
        )}
      </div>

      {/* Card */}
      <div className="relative flex-1">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentId}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 28 }, opacity: { duration: 0.18 } }}
            className="absolute inset-0 w-full"
          >
            <div className="bg-white border rounded-3xl p-8 h-full flex flex-col justify-center shadow-sm" style={{ borderColor: "#EBD6DC" }}>
              <h2 className="text-2xl font-bold font-serif mb-8 text-foreground leading-tight text-center" style={{ color: "#674D66" }}>
                {currentQ.title}
              </h2>
              <div className="space-y-3">
                {currentQ.options.map((option, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleAnswer(option)}
                    className="w-full text-left p-4 rounded-2xl border-2 bg-background hover:shadow-sm font-medium text-foreground transition-all flex items-center justify-between group"
                    style={{ borderColor: "#EBD6DC" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#674D66")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#EBD6DC")}
                  >
                    <span>{option.label}</span>
                    <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
