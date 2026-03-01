import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { iconMap, AVAILABLE_ICONS } from '../data/defaultLinks';

interface IconPickerProps {
  selected: string;
  onSelect: (iconName: string) => void;
}

export default function IconPicker({ selected, onSelect }: IconPickerProps) {
  const [search, setSearch] = useState('');

  const filtered = AVAILABLE_ICONS.filter(name =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search icons..."
          className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 pl-8 pr-3 py-1.5 text-xs font-rajdhani focus:outline-none focus:border-gold-accent/60 placeholder-gray-600"
        />
      </div>
      <div className="grid grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1">
        {filtered.map(iconName => {
          const Icon = iconMap[iconName];
          const isSelected = selected === iconName;
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onSelect(iconName)}
              title={iconName}
              className={`flex items-center justify-center w-9 h-9 transition-all ${
                isSelected
                  ? 'bg-military-green-primary border border-gold-accent/60 text-gold-accent'
                  : 'bg-surface-darkest border border-military-green-accent/20 text-gray-500 hover:border-military-green-accent/60 hover:text-military-green-accent'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
