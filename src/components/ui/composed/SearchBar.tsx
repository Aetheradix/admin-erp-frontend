import React from 'react';
import { Input } from '../primitives/Input';
import { Button } from '../primitives/Button';
import { classNames } from 'primereact/utils';

interface SearchBarProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({ value, onChange, onSearch, placeholder = 'Search...', className }: SearchBarProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value || '');
    }
  };

  return (
    <div className={classNames('relative flex items-center w-full max-w-md gap-2', className)}>
      <div className="relative flex-1">
        {/* <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted" /> */}
        <Input
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-4"
        />
      </div>
      <Button 
        icon="pi pi-sliders-h" 
        variant="secondary" 
        size="medium"
        className="rounded-card"
        onClick={() => onSearch && onSearch(value || '')}
      />
    </div>
  );
};
