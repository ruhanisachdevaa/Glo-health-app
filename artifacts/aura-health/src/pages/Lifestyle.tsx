import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetWorkouts, useGetNutritionTips, useGetMentalHealthResources } from "@workspace/api-client-react";
import { Dumbbell, Utensils, Brain, Clock, Flame, Apple, Heart } from "lucide-react";

export default function Lifestyle() {
  const [activeTab, setActiveTab] = useState<"gym" | "nutrition" | "mind">("gym");
  const [selectedPhase, setSelectedPhase] = useState<string>("all");

  const { data: workouts, isLoading: workoutsLoading } = useGetWorkouts();
  const { data: nutrition, isLoading: nutritionLoading } = useGetNutritionTips();
  const { data: mentalHealth, isLoading: mentalHealthLoading } = useGetMentalHealthResources();

  const phases = ["all", "menstrual", "follicular", "ovulation", "luteal"];

  const filteredWorkouts = workouts?.filter(w => selectedPhase === "all" || w.phase === selectedPhase || w.phase === "all");
  const filteredNutrition = nutrition?.filter(n => selectedPhase === "all" || n.phase === selectedPhase || n.phase === "all");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-serif">Lifestyle Hub</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Nourish your body, move with intention, and care for your mind based on where you are in your cycle.
        </p>

        {/* Custom Tabs */}
        <div className="flex bg-secondary/50 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab("gym")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === "gym" ? "bg-white dark:bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Dumbbell size={18} />
            Cycle Gym
          </button>
          <button 
            onClick={() => setActiveTab("nutrition")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === "nutrition" ? "bg-white dark:bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Utensils size={18} />
            Nutrition
          </button>
          <button 
            onClick={() => setActiveTab("mind")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === "mind" ? "bg-white dark:bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Brain size={18} />
            Mind Space
          </button>
        </div>
      </header>

      {/* Phase Filter (only for gym and nutrition) */}
      <AnimatePresence>
        {activeTab !== "mind" && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {phases.map(phase => (
              <button
                key={phase}
                onClick={() => setSelectedPhase(phase)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize border ${
                  selectedPhase === phase 
                    ? "bg-primary text-white border-primary" 
                    : "bg-transparent text-muted-foreground border-border hover:border-primary/30"
                }`}
              >
                {phase}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === "gym" && (
          workoutsLoading ? (
            <div className="col-span-full h-64 flex items-center justify-center">Loading workouts...</div>
          ) : (
            filteredWorkouts?.map((workout) => (
              <motion.div 
                key={workout.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-3xl overflow-hidden border shadow-sm group hover:shadow-md transition-all flex flex-col"
              >
                <div className="h-48 bg-secondary/50 relative overflow-hidden flex items-center justify-center">
                  <Dumbbell className="text-primary/20 w-24 h-24 absolute" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-white/90 dark:bg-black/50 backdrop-blur text-xs font-bold px-3 py-1 rounded-full capitalize">
                      {workout.phase}
                    </span>
                    <span className="bg-white/90 dark:bg-black/50 backdrop-blur text-xs font-bold px-3 py-1 rounded-full capitalize text-primary">
                      {workout.intensity}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2">{workout.name}</h3>
                  <p className="text-muted-foreground text-sm flex-1">{workout.description}</p>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock size={16} className="text-muted-foreground" />
                      {workout.duration} min
                    </div>
                    <button className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                      Start <Flame size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )
        )}

        {activeTab === "nutrition" && (
          nutritionLoading ? (
            <div className="col-span-full h-64 flex items-center justify-center">Loading nutrition...</div>
          ) : (
            filteredNutrition?.map((tip) => (
              <motion.div 
                key={tip.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-3xl overflow-hidden border shadow-sm group hover:shadow-md transition-all flex flex-col"
              >
                <div className="h-40 bg-accent/20 relative overflow-hidden flex items-center justify-center">
                  <Apple className="text-accent/40 w-20 h-20 absolute" />
                  <span className="absolute top-4 left-4 bg-white/90 dark:bg-black/50 backdrop-blur text-xs font-bold px-3 py-1 rounded-full capitalize">
                    {tip.phase} Phase
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2">{tip.title}</h3>
                  <p className="text-muted-foreground text-sm flex-1">{tip.description}</p>
                  
                  <div className="mt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Recommended Foods</h4>
                    <div className="flex flex-wrap gap-2">
                      {tip.foods.map(food => (
                        <span key={food} className="bg-secondary text-secondary-foreground text-xs px-2.5 py-1 rounded-md font-medium">
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )
        )}

        {activeTab === "mind" && (
          mentalHealthLoading ? (
            <div className="col-span-full h-64 flex items-center justify-center">Loading resources...</div>
          ) : (
            mentalHealth?.map((resource) => (
              <motion.div 
                key={resource.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-card to-secondary/30 rounded-3xl overflow-hidden border shadow-sm group hover:shadow-md transition-all flex flex-col p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Heart size={24} />
                  </div>
                  <span className="bg-background border text-xs font-bold px-3 py-1 rounded-full capitalize">
                    {resource.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 font-serif">{resource.title}</h3>
                <p className="text-muted-foreground text-sm flex-1">{resource.description}</p>
                
                {resource.tips && resource.tips.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {resource.tips.slice(0, 2).map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Clock size={14} />
                    {resource.readTime} min read
                  </div>
                  <button className="text-primary font-bold text-sm hover:underline">
                    Read Article
                  </button>
                </div>
              </motion.div>
            ))
          )
        )}
      </div>
    </motion.div>
  );
}
