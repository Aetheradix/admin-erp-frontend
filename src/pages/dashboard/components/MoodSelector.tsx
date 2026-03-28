import { Smile, Meh, Frown } from 'lucide-react';

interface MoodSelectorProps {
  selectedMood: number | null;
  isSubmittingMood: boolean;
  onMoodSelect: (score: number, label: string) => void;
}

const MOODS = [
  { value: 1, icon: Frown, label: 'Awful', color: 'text-error' },
  { value: 2, icon: Frown, label: 'Bad', color: 'text-warning' },
  { value: 3, icon: Meh, label: 'Okay', color: 'text-info' },
  { value: 4, icon: Smile, label: 'Good', color: 'text-success' },
  { value: 5, icon: Smile, label: 'Great', color: 'text-primary' },
];

export const MoodSelector = ({ selectedMood, isSubmittingMood, onMoodSelect }: MoodSelectorProps) => {
  return (
    <div className="mt-8 w-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black text-muted uppercase tracking-widest">How are you feeling?</p>
        {selectedMood && (
          <span className="text-[10px] font-bold text-success flex items-center gap-1 animate-in fade-in zoom-in">
            <div className="w-1 h-1 rounded-full bg-success"></div>
            LOGGED
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        {MOODS.map((m) => (
          <button
            key={m.value}
            onClick={() => onMoodSelect(m.value, m.label)}
            disabled={isSubmittingMood}
            className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 border ${
              selectedMood === m.value 
                ? 'bg-primary/5 border-primary/20 shadow-sm' 
                : 'bg-surface-subtle border-transparent hover:border-border-subtle hover:bg-surface-elevated'
            }`}
          >
            <m.icon size={20} className={selectedMood === m.value ? 'text-primary' : 'text-muted/60'} />
            <span className={`text-[8px] font-bold uppercase tracking-tighter ${selectedMood === m.value ? 'text-primary' : 'text-muted'}`}>
              {m.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
