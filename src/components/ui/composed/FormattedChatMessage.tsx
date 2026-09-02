import React from 'react';
import {
  BarChart3,
  Clock,
  Users,
  CheckSquare,
  CreditCard,
  Package,
  Settings,
  Rocket,
  Lightbulb,
  Zap,
  Search,
  TrendingUp,
  Lock,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Key,
  Globe,
  Briefcase,
  Award,
  Pin,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';

interface FormattedChatMessageProps {
  content: string;
  isUser?: boolean;
}

// Map emoji characters to Lucide icons with custom colors
const EMOJI_ICON_MAP: Record<string, { icon: LucideIcon; bg: string; color: string }> = {
  '📊': {
    icon: BarChart3,
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  '⏱️': {
    icon: Clock,
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    color: 'text-amber-600 dark:text-amber-400',
  },
  '🕒': {
    icon: Clock,
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    color: 'text-amber-600 dark:text-amber-400',
  },
  '👥': {
    icon: Users,
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    color: 'text-indigo-600 dark:text-indigo-400',
  },
  '👤': {
    icon: Users,
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    color: 'text-indigo-600 dark:text-indigo-400',
  },
  '📋': {
    icon: CheckSquare,
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    color: 'text-blue-600 dark:text-blue-400',
  },
  '📝': {
    icon: FileText,
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    color: 'text-blue-600 dark:text-blue-400',
  },
  '💳': {
    icon: CreditCard,
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    color: 'text-purple-600 dark:text-purple-400',
  },
  '📦': {
    icon: Package,
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    color: 'text-orange-600 dark:text-orange-400',
  },
  '⚙️': {
    icon: Settings,
    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
    color: 'text-slate-600 dark:text-slate-400',
  },
  '🚀': {
    icon: Rocket,
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    color: 'text-rose-600 dark:text-rose-400',
  },
  '💡': { icon: Lightbulb, bg: 'bg-amber-500/10 dark:bg-amber-500/20', color: 'text-amber-500' },
  '⚡': {
    icon: Zap,
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  '🔍': {
    icon: Search,
    bg: 'bg-sky-500/10 dark:bg-sky-500/20',
    color: 'text-sky-600 dark:text-sky-400',
  },
  '📈': {
    icon: TrendingUp,
    bg: 'bg-teal-500/10 dark:bg-teal-500/20',
    color: 'text-teal-600 dark:text-teal-400',
  },
  '🔒': {
    icon: Lock,
    bg: 'bg-violet-500/10 dark:bg-violet-500/20',
    color: 'text-violet-600 dark:text-violet-400',
  },
  '🎯': {
    icon: Target,
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    color: 'text-red-600 dark:text-red-400',
  },
  '✨': { icon: Sparkles, bg: 'bg-amber-500/10 dark:bg-amber-500/20', color: 'text-amber-500' },
  '✅': {
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  '⚠️': {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    color: 'text-amber-600 dark:text-amber-400',
  },
  '❌': {
    icon: XCircle,
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    color: 'text-red-600 dark:text-red-400',
  },
  '🔑': {
    icon: Key,
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  '🌐': {
    icon: Globe,
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    color: 'text-cyan-600 dark:text-cyan-400',
  },
  '💼': {
    icon: Briefcase,
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    color: 'text-indigo-600 dark:text-indigo-400',
  },
  '🏆': { icon: Award, bg: 'bg-amber-500/10 dark:bg-amber-500/20', color: 'text-amber-500' },
  '📌': {
    icon: Pin,
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    color: 'text-rose-600 dark:text-rose-400',
  },
};

/**
 * Replace emojis inside a string segment with custom Lucide Icon badges
 */
function renderInlineWithIcons(text: string, isUser?: boolean): React.ReactNode[] {
  // Regex matching any known emoji key
  const emojiKeys = Object.keys(EMOJI_ICON_MAP);
  if (emojiKeys.length === 0) return [text];

  const regex = new RegExp(
    `(${emojiKeys.map((k) => k.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')).join('|')})`,
    'g'
  );
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const matched = EMOJI_ICON_MAP[part];
    if (matched) {
      const IconComponent = matched.icon;
      if (isUser) {
        return (
          <span
            key={index}
            className="inline-flex items-center justify-center align-middle mx-1 p-1 rounded-md bg-white/20 text-white"
          >
            <IconComponent size={14} />
          </span>
        );
      }
      return (
        <span
          key={index}
          className={`inline-flex items-center justify-center align-middle mx-1 px-1.5 py-0.5 rounded-lg ${matched.bg} ${matched.color} border border-current/10 shadow-2xs font-sans text-xs`}
        >
          <IconComponent size={13} className="shrink-0" />
        </span>
      );
    }

    // Process basic inline markdown bold (**text**)
    return renderBoldInline(part, index);
  });
}

/**
 * Parses inline **bold** syntax
 */
function renderBoldInline(text: string, keyPrefix: number | string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <React.Fragment key={keyPrefix}>
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return (
            <strong key={idx} className="font-bold text-foreground">
              {boldText}
            </strong>
          );
        }
        return part;
      })}
    </React.Fragment>
  );
}

export const FormattedChatMessage: React.FC<FormattedChatMessageProps> = ({ content, isUser }) => {
  if (isUser) {
    return (
      <div className="whitespace-pre-wrap font-sans">{renderInlineWithIcons(content, true)}</div>
    );
  }

  // Split into lines for block-level parsing
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={lineIndex} className="h-2" />);
      return;
    }

    // Header 3 or bold section title: ### Title or **Title**
    if (trimmed.startsWith('###') || (trimmed.startsWith('**"') && trimmed.endsWith('"**'))) {
      const title = trimmed
        .replace(/^###\s*/, '')
        .replace(/^\*\*/, '')
        .replace(/\*\*$/, '')
        .replace(/^"/, '')
        .replace(/"$/, '');
      elements.push(
        <div
          key={lineIndex}
          className="flex items-center gap-2 my-2.5 pb-1.5 border-b border-border-subtle/60 text-sm font-bold text-foreground"
        >
          <span className="w-1.5 h-4 rounded-full bg-primary" />
          <span>{renderInlineWithIcons(title)}</span>
        </div>
      );
      return;
    }

    // Numbered list item e.g. "1. 📊 **Dashboard & Analytics**: ..."
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      const num = numMatch[1];
      const itemContent = numMatch[2];
      elements.push(
        <div
          key={lineIndex}
          className="flex items-start gap-2.5 my-1.5 p-2 rounded-xl bg-surface-subtle/50 hover:bg-surface-subtle border border-border-subtle/40 transition-colors group"
        >
          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            {num}
          </span>
          <div className="flex-1 text-xs text-foreground/90 leading-relaxed font-sans">
            {renderInlineWithIcons(itemContent)}
          </div>
        </div>
      );
      return;
    }

    // Bullet point item e.g. "- **Item**" or "* Item"
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemContent = trimmed.slice(2);
      elements.push(
        <div key={lineIndex} className="flex items-start gap-2 my-1 pl-1">
          <ChevronRight size={13} className="text-primary shrink-0 mt-1" />
          <div className="flex-1 text-xs text-foreground/90 leading-relaxed font-sans">
            {renderInlineWithIcons(itemContent)}
          </div>
        </div>
      );
      return;
    }

    // Quoted string or footer note (e.g. "How would you like to proceed...")
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      const quoteText = trimmed.slice(1, -1);
      elements.push(
        <div
          key={lineIndex}
          className="my-3 p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs text-foreground font-medium flex items-start gap-2"
        >
          <Sparkles size={14} className="text-primary shrink-0 mt-0.5" />
          <div className="italic">{renderInlineWithIcons(quoteText)}</div>
        </div>
      );
      return;
    }

    // Default paragraph
    elements.push(
      <p key={lineIndex} className="my-1 text-xs text-foreground/90 leading-relaxed font-sans">
        {renderInlineWithIcons(trimmed)}
      </p>
    );
  });

  return <div className="space-y-1">{elements}</div>;
};
