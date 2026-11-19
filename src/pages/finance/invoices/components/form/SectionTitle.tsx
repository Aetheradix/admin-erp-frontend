import type React from 'react';

interface SectionTitleProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  rightElement?: React.ReactNode;
}

export function SectionTitle({ icon, title, description, rightElement }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-gray-100 text-gray-800 rounded-xl">{icon}</div>
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      {rightElement}
    </div>
  );
}
