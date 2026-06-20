import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetZenScores, useSaveZenScore } from "@workspace/api-client-react";
import { Sparkles, RefreshCw, Trophy, Clock, Brain, Star } from "lucide-react";

// Game Symbols
const CARDS = [
  { id: 1, symbol: "🌸", name: "Lotus" },
  { id: 2, symbol: "🌙", name: "Moon" },
  { id: 3, symbol: "✨", name: "Sparkles" },
  { id: 4, symbol: "🍵", name: "Tea" },
  { id: 5, symbol: "🧘‍♀️", name: "Meditate" },
  { id: 6, symbol: "🌊", name: "Water" },
  { id: 7, symbol: "🌿", name: "Leaf" },
  { id: 8, symbol: "🕯️", name: "Candle" },
];

type Card = {
  id: string;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
};

export default function ZenZone() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  
  const { data: scores } = useGetZenScores();
  const saveScore = useSaveZenScore();

  // Initialize game
  const initGame = () => {
    const shuffledCards = [...CARDS, ...CARDS]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({
        id: `${card.id}-${index}`,
        symbol: card.symbol,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffledCards);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setTime(0);
    setIsPlaying(true);
    setGameWon(false);
  };

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !gameWon) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameWon]);

  // Handle card click
  const handleCardClick = (index: number) => {
    if (!isPlaying || gameWon) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndices.length === 2) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIndex, secondIndex] = newFlippedIndices;
      
      if (newCards[firstIndex].symbol === newCards[secondIndex].symbol) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setMatches((prev) => prev + 1);
          
          if (matches + 1 === CARDS.length) {
            handleWin();
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const handleWin = () => {
    setGameWon(true);
    setIsPlaying(false);
    
    // Calculate score based on moves and time (lower is better)
    const baseScore = 1000;
    const timeDeduction = time * 2;
    const movesDeduction = moves * 5;
    const finalScore = Math.max(100, baseScore - timeDeduction - movesDeduction);
    
    saveScore.mutate({
      data: {
        score: finalScore,
        level: 1,
        timeSeconds: time
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <header className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
          <Brain size={32} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-serif">Zen Zone</h1>
        <p className="text-muted-foreground text-lg">
          Take a moment to breathe. Match the calming symbols to train your memory and earn Glo Points.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Board */}
        <div className="lg:col-span-2 bg-gradient-to-br from-card to-secondary/30 rounded-3xl p-8 shadow-sm border relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-8 bg-white dark:bg-black/20 p-4 rounded-2xl shadow-sm border">
            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Time</span>
                <span className="text-xl font-bold flex items-center gap-2"><Clock size={18} className="text-primary" /> {formatTime(time)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Moves</span>
                <span className="text-xl font-bold flex items-center gap-2"><RefreshCw size={18} className="text-primary" /> {moves}</span>
              </div>
            </div>
            
            <button 
              onClick={initGame}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold shadow-sm hover:scale-105 transition-transform"
            >
              {cards.length === 0 ? "Start Game" : "Restart"}
            </button>
          </div>

          {cards.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-primary/20 rounded-3xl">
              <Sparkles className="w-16 h-16 text-primary/40 mb-4" />
              <h3 className="text-xl font-bold mb-2 font-serif">Ready to find your focus?</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">Clear your mind and match all the pairs as quickly as possible with the fewest moves.</p>
              <button 
                onClick={initGame}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold text-lg shadow-md hover:scale-105 transition-transform"
              >
                Play Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:gap-4 relative z-10">
              {cards.map((card, index) => (
                <motion.button
                  key={card.id}
                  whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
                  whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
                  onClick={() => handleCardClick(index)}
                  className={`aspect-square sm:aspect-[3/4] rounded-2xl sm:rounded-3xl flex items-center justify-center text-4xl sm:text-5xl cursor-pointer transition-all duration-300 transform-gpu preserve-3d shadow-sm ${
                    card.isFlipped || card.isMatched
                      ? "bg-white dark:bg-card border-2 border-primary/20 rotate-y-180"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                  style={{ perspective: "1000px" }}
                >
                  <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
                    <div 
                      className={`absolute w-full h-full flex items-center justify-center backface-hidden transition-all duration-500 ${
                        card.isFlipped || card.isMatched ? "rotate-y-180 opacity-0" : "opacity-100"
                      }`}
                    >
                      <Sparkles size={24} className="opacity-50" />
                    </div>
                    <div 
                      className={`absolute w-full h-full flex items-center justify-center backface-hidden transition-all duration-500 ${
                        card.isFlipped || card.isMatched ? "opacity-100" : "rotate-y-180 opacity-0"
                      }`}
                    >
                      <span className={card.isMatched ? "animate-bounce" : ""}>{card.symbol}</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Win Overlay */}
          <AnimatePresence>
            {gameWon && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-20 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-accent-foreground mb-6 shadow-lg animate-bounce">
                  <Trophy size={48} />
                </div>
                <h2 className="text-4xl font-bold font-serif mb-2">Mindful Master!</h2>
                <p className="text-xl text-muted-foreground mb-8">You completed the puzzle in {moves} moves and {formatTime(time)}.</p>
                
                <div className="flex gap-4">
                  <div className="bg-card border rounded-2xl p-4 min-w-[120px]">
                    <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Glo Points</p>
                    <p className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                      <Star size={20} className="fill-current" /> +50
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={initGame}
                  className="mt-8 bg-foreground text-background px-8 py-3 rounded-full font-bold text-lg shadow-md hover:scale-105 transition-transform"
                >
                  Play Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Leaderboard */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-accent-foreground" />
            <h2 className="text-xl font-bold font-serif">Past Sessions</h2>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {!scores || scores.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Play your first game to see your scores here.</p>
            ) : (
              scores.map((score, idx) => (
                <div key={score.id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-transparent hover:border-border transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-background flex items-center justify-center font-bold text-sm text-muted-foreground shadow-sm">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-sm">Level {score.level}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(score.timeSeconds)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{score.score}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Score</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
