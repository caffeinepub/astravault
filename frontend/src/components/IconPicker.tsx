import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { ICON_MAP, AVAILABLE_ICONS } from '../data/defaultLinks';

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
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search icons..."
          className="w-full bg-surface-2 border border-border rounded pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green transition-colors"
        />
      </div>
      <div className="grid grid-cols-6 gap-1.5 max-h-36 overflow-y-auto scrollbar-thin p-1">
        {filtered.map(iconName => {
          const Icon = ICON_MAP[iconName];
          const isSelected = selected === iconName;
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onSelect(iconName)}
              title={iconName}
              className={`flex items-center justify-center w-9 h-9 rounded transition-all ${
                isSelected
                  ? 'bg-military-green text-white shadow-green'
                  : 'bg-surface-3 text-muted-foreground hover:bg-military-green-dim hover:text-military-green-bright'
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
