import { useState } from "react";
import { motion } from "framer-motion";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Droplet } from "lucide-react";
import { useGetCycleEntries, useCreateCycleEntry } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Tracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  const { data: entries, isLoading } = useGetCycleEntries();
  const createEntry = useCreateCycleEntry();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = monthStart;
  const endDate = monthEnd;

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  // Calculate empty spaces for the first week
  const startDayOfWeek = startDate.getDay(); // 0 is Sunday
  const emptyDays = Array.from({ length: startDayOfWeek }).map((_, i) => i);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Determine if a day has an entry
  const getDayEntry = (day: Date) => {
    if (!entries) return null;
    const dateStr = format(day, "yyyy-MM-dd");
    return entries.find(e => e.date.startsWith(dateStr));
  };

  const handleLogPeriod = (flow: "light" | "medium" | "heavy") => {
    if (!selectedDate) return;
    createEntry.mutate({
      data: {
        date: format(selectedDate, "yyyy-MM-dd"),
        type: "period_start",
        flow
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-serif">Cycle Tracker</h1>
        <p className="text-muted-foreground text-lg">Log your flow, spotting, and predictions.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-card rounded-3xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold font-serif">{format(currentDate, dateFormat)}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-full hover:bg-secondary transition-colors">
                <ChevronLeft size={24} />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-full hover:bg-secondary transition-colors">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-4 gap-x-2">
            {emptyDays.map(d => (
              <div key={`empty-${d}`} className="h-16 rounded-2xl bg-transparent" />
            ))}
            
            {days.map(day => {
              const entry = getDayEntry(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);
              
              let bgClass = "bg-secondary/20 hover:bg-secondary/80";
              let textClass = "text-foreground";
              
              if (isSelected) {
                bgClass = "bg-primary text-white shadow-md";
                textClass = "text-white font-bold";
              } else if (isCurrentDay) {
                textClass = "text-primary font-bold";
                bgClass = "bg-primary/10 border-2 border-primary/20";
              }

              if (entry && entry.type === "period_start") {
                bgClass = isSelected ? "bg-red-500 text-white" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
                if (!isSelected) textClass = "font-bold";
              } else if (entry && entry.type === "ovulation") {
                bgClass = isSelected ? "bg-accent-foreground text-white" : "bg-accent text-accent-foreground";
                if (!isSelected) textClass = "font-bold";
              }

              return (
                <button 
                  key={day.toString()} 
                  onClick={() => setSelectedDate(day)}
                  className={`h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${bgClass}`}
                >
                  <span className={textClass}>{format(day, "d")}</span>
                  {entry && (
                    <div className="w-1.5 h-1.5 rounded-full mt-1 bg-current opacity-70" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span>Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent-foreground" />
              <span>Ovulation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-300" />
              <span>Fertile Window</span>
            </div>
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-secondary/50 to-background rounded-3xl p-6 shadow-sm border">
            <h3 className="text-xl font-bold mb-2">
              {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a day"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {isToday(selectedDate || new Date()) ? "Today" : "Past entry"}
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-card border shadow-sm">
                <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wider">Log Flow</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleLogPeriod("light")}
                    className="flex flex-col items-center p-3 rounded-xl hover:bg-red-50 focus:bg-red-100 dark:hover:bg-red-900/20 text-red-400 transition-colors border border-transparent hover:border-red-200"
                  >
                    <Droplet size={20} className="mb-1" />
                    <span className="text-xs font-medium text-foreground">Light</span>
                  </button>
                  <button 
                    onClick={() => handleLogPeriod("medium")}
                    className="flex flex-col items-center p-3 rounded-xl hover:bg-red-50 focus:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors border border-transparent hover:border-red-200"
                  >
                    <div className="flex mb-1">
                      <Droplet size={20} className="-mr-1" />
                      <Droplet size={20} />
                    </div>
                    <span className="text-xs font-medium text-foreground">Medium</span>
                  </button>
                  <button 
                    onClick={() => handleLogPeriod("heavy")}
                    className="flex flex-col items-center p-3 rounded-xl hover:bg-red-50 focus:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-colors border border-transparent hover:border-red-200"
                  >
                    <div className="flex mb-1">
                      <Droplet size={20} className="-mr-2" />
                      <Droplet size={20} className="-mr-2" />
                      <Droplet size={20} />
                    </div>
                    <span className="text-xs font-medium text-foreground">Heavy</span>
                  </button>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
                    <Plus size={20} />
                    Add Note / Spotting
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Entry for {selectedDate ? format(selectedDate, "MMM d") : ""}</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <p className="text-muted-foreground text-sm">Full form would go here to log spotting, temperature, or custom notes.</p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="bg-card rounded-3xl p-6 shadow-sm border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">!</span>
              Did you know?
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your cycle is more than just your period. It consists of four distinct phases: menstrual, follicular, ovulation, and luteal. Each phase affects your energy, mood, and metabolism differently.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
