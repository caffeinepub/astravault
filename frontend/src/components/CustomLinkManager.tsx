import { useState } from 'react';
import { useAddCustomLink, useEditCustomLink, useDeleteCustomLink, useGetCustomLinks } from '../hooks/useQueries';
import { defaultLinkCategories, iconMap } from '../data/defaultLinks';
import IconPicker from './IconPicker';
import { Plus, Edit2, Trash2, X, ExternalLink } from 'lucide-react';
import type { CustomLink } from '../backend';

interface CustomLinkManagerProps {
  onClose: () => void;
}

type Mode = 'list' | 'add' | 'edit';

export default function CustomLinkManager({ onClose }: CustomLinkManagerProps) {
  const { data: customLinks = [] } = useGetCustomLinks();
  const addLink = useAddCustomLink();
  const editLink = useEditCustomLink();
  const deleteLink = useDeleteCustomLink();

  const [mode, setMode] = useState<Mode>('list');
  const [editingLink, setEditingLink] = useState<CustomLink | null>(null);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState(defaultLinkCategories[0]?.id ?? 'BANK');
  const [customCategory, setCustomCategory] = useState('');
  const [iconName, setIconName] = useState('Globe');
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setUrl('');
    setCategory(defaultLinkCategories[0]?.id ?? 'BANK');
    setCustomCategory('');
    setIconName('Globe');
    setUseCustomCategory(false);
    setError('');
  };

  const openAdd = () => {
    resetForm();
    setMode('add');
  };

  const openEdit = (link: CustomLink) => {
    setEditingLink(link);
    setName(link.name);
    setUrl(link.url);
    const isDefault = defaultLinkCategories.some((c) => c.id === link.category);
    if (isDefault) {
      setCategory(link.category);
      setUseCustomCategory(false);
    } else {
      setCustomCategory(link.category);
      setUseCustomCategory(true);
    }
    setIconName(link.iconName);
    setError('');
    setMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Name is required'); return; }
    if (!url.trim()) { setError('URL is required'); return; }

    const finalCategory = useCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) { setError('Category is required'); return; }

    try {
      if (mode === 'add') {
        await addLink.mutateAsync({ name: name.trim(), url: url.trim(), category: finalCategory, iconName });
      } else if (mode === 'edit' && editingLink) {
        await editLink.mutateAsync({ id: editingLink.id, name: name.trim(), url: url.trim(), category: finalCategory, iconName });
      }
      setMode('list');
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleDelete = async (link: CustomLink) => {
    if (!confirm(`Delete "${link.name}"?`)) return;
    try {
      await deleteLink.mutateAsync(link.id);
    } catch (err: unknown) {
      console.error('Delete failed:', err);
    }
  };

  const allCategories = defaultLinkCategories.map((c) => ({ id: c.id, label: c.label }));

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col"
        style={{
          backgroundColor: 'var(--color-surface-dark)',
          border: '1px solid var(--color-military-green-primary)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.9)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-military-green-primary)' }}
        >
          <h2
            className="font-rajdhani text-lg font-bold tracking-widest uppercase"
            style={{ color: 'var(--color-gold-accent)' }}
          >
            {mode === 'list' ? 'Custom Links' : mode === 'add' ? 'Add Link' : 'Edit Link'}
          </h2>
          <button
            onClick={onClose}
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold-accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {mode === 'list' && (
            <div className="space-y-3">
              <button
                onClick={openAdd}
                className="w-full flex items-center justify-center gap-2 py-2.5 font-rajdhani font-bold tracking-widest uppercase text-sm transition-all"
                style={{
                  border: '1px dashed var(--color-gold-accent)',
                  color: 'var(--color-gold-accent)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Plus size={16} />
                Add New Link
              </button>

              {customLinks.length === 0 ? (
                <p className="text-center font-inter text-sm py-6" style={{ color: 'var(--color-text-muted)' }}>
                  No custom links yet. Add your first link above.
                </p>
              ) : (
                customLinks.map((link) => {
                  const Icon = iconMap[link.iconName] ?? iconMap['Globe'];
                  return (
                    <div
                      key={String(link.id)}
                      className="flex items-center gap-3 px-3 py-2.5"
                      style={{
                        backgroundColor: 'var(--color-surface-mid)',
                        border: '1px solid var(--color-military-green-muted)',
                      }}
                    >
                      <div
                        className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'var(--color-military-green-muted)' }}
                      >
                        {Icon && <Icon size={16} style={{ color: 'var(--color-gold-accent)' }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {link.name}
                        </p>
                        <p className="font-inter text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                          {link.url}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 transition-colors"
                          style={{ color: 'var(--color-text-muted)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold-accent)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          onClick={() => openEdit(link)}
                          className="p-1.5 transition-colors"
                          style={{ color: 'var(--color-text-muted)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-military-green-light)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(link)}
                          className="p-1.5 transition-colors"
                          style={{ color: 'var(--color-text-muted)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {(mode === 'add' || mode === 'edit') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-rajdhani text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--color-military-green-light)' }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Link name"
                  className="w-full px-3 py-2 font-inter text-sm military-input"
                  required
                />
              </div>

              <div>
                <label className="block font-rajdhani text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--color-military-green-light)' }}>
                  URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 font-inter text-sm military-input"
                  required
                />
              </div>

              <div>
                <label className="block font-rajdhani text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--color-military-green-light)' }}>
                  Category *
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-1.5 font-inter text-xs cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={useCustomCategory}
                      onChange={(e) => setUseCustomCategory(e.target.checked)}
                      className="accent-gold-accent"
                    />
                    Custom category
                  </label>
                </div>
                {useCustomCategory ? (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category"
                    className="w-full px-3 py-2 font-inter text-sm military-input"
                  />
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 font-inter text-sm military-input"
                  >
                    {allCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-rajdhani text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--color-military-green-light)' }}>
                  Icon
                </label>
                <IconPicker selected={iconName} onSelect={setIconName} />
              </div>

              {error && (
                <div
                  className="px-3 py-2 font-inter text-sm"
                  style={{
                    backgroundColor: 'rgba(180,40,40,0.15)',
                    border: '1px solid rgba(180,40,40,0.4)',
                    color: '#f87171',
                  }}
                >
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('list'); resetForm(); }}
                  className="flex-1 py-2.5 font-rajdhani font-semibold tracking-wider uppercase text-sm transition-all"
                  style={{
                    border: '1px solid var(--color-military-green-primary)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLink.isPending || editLink.isPending}
                  className="flex-1 py-2.5 font-rajdhani font-bold tracking-wider uppercase text-sm transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-gold-accent)',
                    color: 'var(--color-surface-darkest)',
                  }}
                >
                  {addLink.isPending || editLink.isPending ? 'Saving...' : mode === 'add' ? 'Add Link' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
