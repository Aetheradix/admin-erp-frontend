import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { COUNTRY_CODES, type CountryCodeItem } from '../utils/countryCodes';

interface InternationalPhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onChange: (countryCode: string, phoneNumber: string) => void;
  error?: string;
  disabled?: boolean;
}

export const InternationalPhoneInput: React.FC<InternationalPhoneInputProps> = ({
  countryCode,
  phoneNumber,
  onChange,
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Active country details
  const currentCountry: CountryCodeItem = useMemo(() => {
    return (
      COUNTRY_CODES.find((c) => c.dialCode === countryCode) ||
      COUNTRY_CODES.find((c) => c.code === 'US') ||
      COUNTRY_CODES[0]
    );
  }, [countryCode]);

  // Filtered countries for search
  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRY_CODES;
    const q = search.toLowerCase().trim();
    return COUNTRY_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const closeDropdown = () => {
    setIsOpen(false);
    setSearch('');
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectCountry = (country: CountryCodeItem) => {
    onChange(country.dialCode, phoneNumber);
    closeDropdown();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(countryCode || '+1', e.target.value);
  };

  return (
    <div className="flex flex-col gap-1 w-full" ref={containerRef}>
      <div
        className={`relative flex items-center w-full h-[46px] rounded-md border bg-white shadow-xs transition-all duration-200 ${
          error
            ? 'border-red-400 ring-2 ring-red-100'
            : isOpen
              ? 'border-primary ring-2 ring-primary/10'
              : 'border-border-subtle hover:border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}>
        {/* Country Selector Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (isOpen) {
              closeDropdown();
            } else {
              setIsOpen(true);
            }
          }}
          className="h-full px-2.5 flex items-center gap-1.5 bg-slate-50/70 hover:bg-slate-100 text-slate-800 transition-colors border-r border-border-subtle shrink-0 cursor-pointer select-none rounded-l-md outline-none"
          title={`Selected: ${currentCountry.name} (${currentCountry.dialCode})`}>
          {/* Flag Image */}
          <img
            src={`https://flagcdn.com/w40/${currentCountry.code.toLowerCase()}.png`}
            alt={currentCountry.name}
            className="w-5 h-3.5 object-cover rounded-[2px] border border-slate-200/80 shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <span className="text-xs font-bold text-slate-800 font-mono tracking-tight">
            {currentCountry.dialCode}
          </span>
          <ChevronDown
            size={12}
            className={`text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-primary' : ''
            }`}
          />
        </button>

        {/* Local Phone Number Input matching Input.tsx */}
        <input
          type="tel"
          disabled={disabled}
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={currentCountry.placeholder || 'Phone number'}
          className="flex-1 h-full px-3 text-sm bg-transparent border-0 text-foreground placeholder:text-muted/50 focus:outline-none font-medium min-w-0"
        />

        {/* Searchable Country Dropdown Popover */}
        {isOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 z-50 w-72 max-w-[calc(100vw-32px)] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input Box */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10 flex items-center gap-2">
              <Search size={14} className="text-slate-400 shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code..."
                className="w-full text-xs py-1 px-1.5 bg-transparent border-0 outline-none text-slate-800 placeholder:text-slate-400 font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-xs text-slate-400 hover:text-slate-700 px-1">
                  ✕
                </button>
              )}
            </div>

            {/* Country List Options */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 py-1">
              {filteredCountries.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                  No matching country found
                </div>
              ) : (
                filteredCountries.map((c) => {
                  const isSelected = c.dialCode === countryCode;
                  return (
                    <button
                      type="button"
                      key={`${c.code}-${c.dialCode}`}
                      onClick={() => handleSelectCountry(c)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50/70 text-[#e8583a] font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}>
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                        <img
                          src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                          alt={c.name}
                          className="w-5 h-3.5 object-cover rounded-[2px] border border-slate-200/80 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="truncate">{c.name}</span>
                        {isSelected && (
                          <Check size={13} className="text-[#e8583a] shrink-0 ml-auto" />
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 shrink-0 pl-1">
                        {c.dialCode}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <span className="text-[11px] font-semibold text-red-500 pl-0.5 animate-in fade-in">
          {error}
        </span>
      )}
    </div>
  );
};
