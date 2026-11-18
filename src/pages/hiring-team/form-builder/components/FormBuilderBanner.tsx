import { Sliders } from 'lucide-react';

interface FormBuilderBannerProps {
  activeSections: number;
}

export function FormBuilderBanner({ activeSections }: FormBuilderBannerProps) {
  return (
    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Sliders size={20} className="text-primary shrink-0" />
        <div className="text-xs text-foreground">
          <strong>Dynamic Form Engine:</strong> Changes made here take effect immediately for all
          pending and new employee onboarding sessions without needing backend code deployments.
        </div>
      </div>
      <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg shrink-0">
        {activeSections} Active Sections
      </span>
    </div>
  );
}
