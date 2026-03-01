import { useState } from 'react';
import { Search } from 'lucide-react';
import { iconMap, AVAILABLE_ICONS } from '../data/defaultLinks';

interface IconPickerProps {
  selected: string;
  onSelect: (iconName: string) => void;
}

export default function IconPicker({ selected, onSelect }: IconPickerProps) {
  const [search, setSearch] = useState('');

  const filtered = AVAILABLE_ICONS.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="relative mb-2">
        <Search
          size={14}
          className="absolute left-2 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--color-text-muted)' }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search icons..."
          className="w-full pl-7 pr-3 py-1.5 font-inter text-xs military-input"
        />
      </div>
      <div
        className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto p-1"
        style={{ backgroundColor: 'var(--color-surface-mid)' }}
      >
        {filtered.map((iconName) => {
          const Icon = iconMap[iconName];
          if (!Icon) return null;
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onSelect(iconName)}
              title={iconName}
              className="flex items-center justify-center p-2 transition-all"
              style={{
                backgroundColor:
                  selected === iconName
                    ? 'var(--color-military-green-primary)'
                    : 'transparent',
                border:
                  selected === iconName
                    ? '1px solid var(--color-gold-accent)'
                    : '1px solid transparent',
                color:
                  selected === iconName
                    ? 'var(--color-gold-accent)'
                    : 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (selected !== iconName) {
                  e.currentTarget.style.backgroundColor = 'var(--color-military-green-muted)';
                  e.currentTarget.style.color = 'var(--color-gold-accent)';
                }
              }}
              onMouseLeave={(e) => {
                if (selected !== iconName) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }
              }}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
