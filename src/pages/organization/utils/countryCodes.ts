export interface CountryCodeItem {
  name: string;
  code: string; // ISO 2-letter
  dialCode: string; // e.g. "+91"
  flag: string; // Emoji flag
  placeholder: string;
  minDigits: number;
  maxDigits: number;
}

export const COUNTRY_CODES: CountryCodeItem[] = [
  {
    name: 'India',
    code: 'IN',
    dialCode: '+91',
    flag: '🇮🇳',
    placeholder: '98765 43210',
    minDigits: 10,
    maxDigits: 10,
  },
  {
    name: 'United States',
    code: 'US',
    dialCode: '+1',
    flag: '🇺🇸',
    placeholder: '(555) 234-5678',
    minDigits: 10,
    maxDigits: 10,
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    dialCode: '+44',
    flag: '🇬🇧',
    placeholder: '7911 123456',
    minDigits: 10,
    maxDigits: 11,
  },
  {
    name: 'United Arab Emirates',
    code: 'AE',
    dialCode: '+971',
    flag: '🇦🇪',
    placeholder: '50 123 4567',
    minDigits: 9,
    maxDigits: 9,
  },
  {
    name: 'Canada',
    code: 'CA',
    dialCode: '+1',
    flag: '🇨🇦',
    placeholder: '(416) 555-0199',
    minDigits: 10,
    maxDigits: 10,
  },
  {
    name: 'Australia',
    code: 'AU',
    dialCode: '+61',
    flag: '🇦🇺',
    placeholder: '412 345 678',
    minDigits: 9,
    maxDigits: 9,
  },
  {
    name: 'Singapore',
    code: 'SG',
    dialCode: '+65',
    flag: '🇸🇬',
    placeholder: '8123 4567',
    minDigits: 8,
    maxDigits: 8,
  },
  {
    name: 'Germany',
    code: 'DE',
    dialCode: '+49',
    flag: '🇩🇪',
    placeholder: '151 23456789',
    minDigits: 10,
    maxDigits: 11,
  },
  {
    name: 'France',
    code: 'FR',
    dialCode: '+33',
    flag: '🇫🇷',
    placeholder: '6 12 34 56 78',
    minDigits: 9,
    maxDigits: 9,
  },
  {
    name: 'Japan',
    code: 'JP',
    dialCode: '+81',
    flag: '🇯🇵',
    placeholder: '90 1234 5678',
    minDigits: 10,
    maxDigits: 10,
  },
  {
    name: 'Saudi Arabia',
    code: 'SA',
    dialCode: '+966',
    flag: '🇸🇦',
    placeholder: '50 123 4567',
    minDigits: 9,
    maxDigits: 9,
  },
  {
    name: 'Netherlands',
    code: 'NL',
    dialCode: '+31',
    flag: '🇳🇱',
    placeholder: '6 12345678',
    minDigits: 9,
    maxDigits: 9,
  },
  {
    name: 'Switzerland',
    code: 'CH',
    dialCode: '+41',
    flag: '🇨🇭',
    placeholder: '78 123 45 67',
    minDigits: 9,
    maxDigits: 9,
  },
  {
    name: 'Ireland',
    code: 'IE',
    dialCode: '+353',
    flag: '🇮🇪',
    placeholder: '85 123 4567',
    minDigits: 9,
    maxDigits: 9,
  },
  {
    name: 'New Zealand',
    code: 'NZ',
    dialCode: '+64',
    flag: '🇳🇿',
    placeholder: '21 123 4567',
    minDigits: 8,
    maxDigits: 10,
  },
  {
    name: 'South Africa',
    code: 'ZA',
    dialCode: '+27',
    flag: '🇿🇦',
    placeholder: '71 123 4567',
    minDigits: 9,
    maxDigits: 9,
  },
  {
    name: 'Brazil',
    code: 'BR',
    dialCode: '+55',
    flag: '🇧🇷',
    placeholder: '11 91234-5678',
    minDigits: 10,
    maxDigits: 11,
  },
  {
    name: 'Mexico',
    code: 'MX',
    dialCode: '+52',
    flag: '🇲🇽',
    placeholder: '55 1234 5678',
    minDigits: 10,
    maxDigits: 10,
  },
  {
    name: 'China',
    code: 'CN',
    dialCode: '+86',
    flag: '🇨🇳',
    placeholder: '138 0013 8000',
    minDigits: 11,
    maxDigits: 11,
  },
  {
    name: 'Spain',
    code: 'ES',
    dialCode: '+34',
    flag: '🇪🇸',
    placeholder: '612 34 56 78',
    minDigits: 9,
    maxDigits: 9,
  },
  {
    name: 'Italy',
    code: 'IT',
    dialCode: '+39',
    flag: '🇮🇹',
    placeholder: '312 345 6789',
    minDigits: 10,
    maxDigits: 10,
  },
  {
    name: 'Sweden',
    code: 'SE',
    dialCode: '+46',
    flag: '🇸🇪',
    placeholder: '70 123 45 67',
    minDigits: 9,
    maxDigits: 9,
  },
  {
    name: 'Norway',
    code: 'NO',
    dialCode: '+47',
    flag: '🇳🇴',
    placeholder: '412 34 567',
    minDigits: 8,
    maxDigits: 8,
  },
  {
    name: 'Denmark',
    code: 'DK',
    dialCode: '+45',
    flag: '🇩🇰',
    placeholder: '20 12 34 56',
    minDigits: 8,
    maxDigits: 8,
  },
  {
    name: 'Finland',
    code: 'FI',
    dialCode: '+358',
    flag: '🇫🇮',
    placeholder: '40 123 4567',
    minDigits: 9,
    maxDigits: 10,
  },
  {
    name: 'Poland',
    code: 'PL',
    dialCode: '+48',
    flag: '🇵🇱',
    placeholder: '512 345 678',
    minDigits: 9,
    maxDigits: 9,
  },
  {
    name: 'Malaysia',
    code: 'MY',
    dialCode: '+60',
    flag: '🇲🇾',
    placeholder: '12-345 6789',
    minDigits: 9,
    maxDigits: 10,
  },
  {
    name: 'Indonesia',
    code: 'ID',
    dialCode: '+62',
    flag: '🇮🇩',
    placeholder: '812-3456-7890',
    minDigits: 10,
    maxDigits: 12,
  },
  {
    name: 'Philippines',
    code: 'PH',
    dialCode: '+63',
    flag: '🇵🇭',
    placeholder: '917 123 4567',
    minDigits: 10,
    maxDigits: 10,
  },
  {
    name: 'Thailand',
    code: 'TH',
    dialCode: '+66',
    flag: '🇹🇭',
    placeholder: '81 234 5678',
    minDigits: 9,
    maxDigits: 9,
  },
  {
    name: 'Vietnam',
    code: 'VN',
    dialCode: '+84',
    flag: '🇻🇳',
    placeholder: '91 234 5678',
    minDigits: 9,
    maxDigits: 10,
  },
  {
    name: 'South Korea',
    code: 'KR',
    dialCode: '+82',
    flag: '🇰🇷',
    placeholder: '10-1234-5678',
    minDigits: 9,
    maxDigits: 10,
  },
  {
    name: 'Qatar',
    code: 'QA',
    dialCode: '+974',
    flag: '🇶🇦',
    placeholder: '3312 3456',
    minDigits: 8,
    maxDigits: 8,
  },
  {
    name: 'Kuwait',
    code: 'KW',
    dialCode: '+965',
    flag: '🇰🇼',
    placeholder: '9123 4567',
    minDigits: 8,
    maxDigits: 8,
  },
  {
    name: 'Oman',
    code: 'OM',
    dialCode: '+968',
    flag: '🇴🇲',
    placeholder: '9123 4567',
    minDigits: 8,
    maxDigits: 8,
  },
  {
    name: 'Bahrain',
    code: 'BH',
    dialCode: '+973',
    flag: '🇧🇭',
    placeholder: '3612 3456',
    minDigits: 8,
    maxDigits: 8,
  },
  {
    name: 'Egypt',
    code: 'EG',
    dialCode: '+20',
    flag: '🇪🇬',
    placeholder: '100 123 4567',
    minDigits: 10,
    maxDigits: 10,
  },
  {
    name: 'Nigeria',
    code: 'NG',
    dialCode: '+234',
    flag: '🇳🇬',
    placeholder: '802 123 4567',
    minDigits: 10,
    maxDigits: 10,
  },
  {
    name: 'Kenya',
    code: 'KE',
    dialCode: '+254',
    flag: '🇰🇪',
    placeholder: '712 345678',
    minDigits: 9,
    maxDigits: 9,
  },
  {
    name: 'Israel',
    code: 'IL',
    dialCode: '+972',
    flag: '🇮🇱',
    placeholder: '50-123-4567',
    minDigits: 9,
    maxDigits: 9,
  },
  {
    name: 'Turkey',
    code: 'TR',
    dialCode: '+90',
    flag: '🇹🇷',
    placeholder: '532 123 4567',
    minDigits: 10,
    maxDigits: 10,
  },
  {
    name: 'Argentina',
    code: 'AR',
    dialCode: '+54',
    flag: '🇦🇷',
    placeholder: '11 1234-5678',
    minDigits: 10,
    maxDigits: 10,
  },
  {
    name: 'Chile',
    code: 'CL',
    dialCode: '+56',
    flag: '🇨🇱',
    placeholder: '9 1234 5678',
    minDigits: 9,
    maxDigits: 9,
  },
  {
    name: 'Colombia',
    code: 'CO',
    dialCode: '+57',
    flag: '🇨🇴',
    placeholder: '300 123 4567',
    minDigits: 10,
    maxDigits: 10,
  },
  {
    name: 'Bangladesh',
    code: 'BD',
    dialCode: '+880',
    flag: '🇧🇩',
    placeholder: '1712-345678',
    minDigits: 10,
    maxDigits: 10,
  },
  {
    name: 'Pakistan',
    code: 'PK',
    dialCode: '+92',
    flag: '🇵🇰',
    placeholder: '300 1234567',
    minDigits: 10,
    maxDigits: 10,
  },
  {
    name: 'Sri Lanka',
    code: 'LK',
    dialCode: '+94',
    flag: '🇱🇰',
    placeholder: '71 234 5678',
    minDigits: 9,
    maxDigits: 9,
  },
  {
    name: 'Nepal',
    code: 'NP',
    dialCode: '+977',
    flag: '🇳🇵',
    placeholder: '984-1234567',
    minDigits: 10,
    maxDigits: 10,
  },
];

/**
 * Split a full phone string into country code and local number
 */
export function parsePhoneNumber(
  fullPhone?: string,
  savedCountryCode?: string,
  savedPhoneNumber?: string
): { countryCode: string; phoneNumber: string } {
  if (savedCountryCode && savedPhoneNumber) {
    return {
      countryCode: savedCountryCode,
      phoneNumber: savedPhoneNumber,
    };
  }

  const clean = (fullPhone || '').trim();
  if (!clean) {
    return { countryCode: '+1', phoneNumber: '' };
  }

  // Sort dial codes by length descending (e.g. +880 before +88)
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sorted) {
    if (clean.startsWith(c.dialCode)) {
      const rest = clean.slice(c.dialCode.length).trim();
      return {
        countryCode: c.dialCode,
        phoneNumber: rest,
      };
    }
  }

  // Fallback if starts with '+'
  const match = clean.match(/^(\+\d{1,4})\s*(.*)$/);
  if (match) {
    return {
      countryCode: match[1],
      phoneNumber: match[2].trim(),
    };
  }

  return {
    countryCode: savedCountryCode || '+1',
    phoneNumber: clean,
  };
}

/**
 * Validate phone number against country rule
 */
export function validatePhoneNumber(
  countryCode: string,
  phoneNumber: string
): { valid: boolean; message?: string } {
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  if (!digitsOnly) {
    return { valid: false, message: 'Please enter a phone number' };
  }

  const country = COUNTRY_CODES.find((c) => c.dialCode === countryCode);
  if (!country) {
    if (digitsOnly.length < 6 || digitsOnly.length > 15) {
      return { valid: false, message: 'Phone number should be between 6 and 15 digits' };
    }
    return { valid: true };
  }

  if (digitsOnly.length < country.minDigits || digitsOnly.length > country.maxDigits) {
    if (country.minDigits === country.maxDigits) {
      return {
        valid: false,
        message: `${country.name} phone number must be ${country.minDigits} digits`,
      };
    }
    return {
      valid: false,
      message: `${country.name} phone number must be between ${country.minDigits} and ${country.maxDigits} digits`,
    };
  }

  return { valid: true };
}
