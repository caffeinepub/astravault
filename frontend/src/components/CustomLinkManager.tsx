import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { useGetCustomLinks, useAddCustomLink, useEditCustomLink, useDeleteCustomLink } from '../hooks/useQueries';
import { iconMap, ALL_CATEGORIES } from '../data/defaultLinks';
import IconPicker from './IconPicker';
import type { CustomLink } from '../backend';

interface CustomLinkManagerProps {
  onClose: () => void;
}

interface LinkForm {
  name: string;
  url: string;
  category: string;
  iconName: string;
  customCategory: string;
}

const emptyForm: LinkForm = {
  name: '',
  url: '',
  category: ALL_CATEGORIES[0],
  iconName: 'Building2',
  customCategory: '',
};

export default function CustomLinkManager({ onClose }: CustomLinkManagerProps) {
  const { data: customLinks = [], isLoading } = useGetCustomLinks();
  const addLink = useAddCustomLink();
  const editLink = useEditCustomLink();
  const deleteLink = useDeleteCustomLink();

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingLink, setEditingLink] = useState<CustomLink | null>(null);
  const [form, setForm] = useState<LinkForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  const openAddForm = () => {
    setEditingLink(null);
    setForm(emptyForm);
    setErrors({});
    setUseCustomCategory(false);
    setView('form');
  };

  const openEditForm = (link: CustomLink) => {
    setEditingLink(link);
    const isCustomCat = !ALL_CATEGORIES.includes(link.category);
    setUseCustomCategory(isCustomCat);
    setForm({
      name: link.name,
      url: link.url,
      category: isCustomCat ? 'CUSTOM' : link.category,
      iconName: link.iconName,
      customCategory: isCustomCat ? link.category : '',
    });
    setErrors({});
    setView('form');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.url.trim()) newErrors.url = 'URL is required';
    else {
      try { new URL(form.url.startsWith('http') ? form.url : `https://${form.url}`); }
      catch { newErrors.url = 'Enter a valid URL'; }
    }
    if (useCustomCategory && !form.customCategory.trim()) newErrors.category = 'Category name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalUrl = form.url.startsWith('http') ? form.url : `https://${form.url}`;
    const finalCategory = useCustomCategory ? form.customCategory.trim().toUpperCase() : form.category;

    try {
      if (editingLink) {
        await editLink.mutateAsync({
          id: editingLink.id,
          name: form.name.trim(),
          url: finalUrl,
          category: finalCategory,
          iconName: form.iconName,
        });
      } else {
        await addLink.mutateAsync({
          name: form.name.trim(),
          url: finalUrl,
          category: finalCategory,
          iconName: form.iconName,
        });
      }
      setView('list');
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to save link' });
    }
  };

  const handleDelete = async (linkId: bigint) => {
    try {
      await deleteLink.mutateAsync(linkId);
    } catch (err) {
      console.error('Delete link error:', err);
    }
  };

  const isPending = addLink.isPending || editLink.isPending;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-surface-dark border border-military-green-accent/40 max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-rajdhani text-xl text-gold-accent tracking-wide uppercase flex items-center gap-2">
            {view === 'list' ? (
              <><Plus className="w-5 h-5" /> Manage Custom Links</>
            ) : (
              <><Edit2 className="w-5 h-5" /> {editingLink ? 'Edit Link' : 'Add New Link'}</>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-xs">
            {view === 'list' ? 'Add, edit, or remove your custom quick-access links.' : 'Fill in the details for your custom link.'}
          </DialogDescription>
        </DialogHeader>

        {view === 'list' ? (
          <div className="flex flex-col gap-3 overflow-hidden">
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 w-full bg-military-green-primary hover:bg-military-green-accent text-gold-accent border border-military-green-accent/40 px-4 py-2.5 text-sm font-rajdhani font-semibold tracking-wider uppercase transition-all"
            >
              <Plus className="w-4 h-4" />
              Add New Link
            </button>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {isLoading ? (
                <p className="text-gray-400 text-sm text-center py-4">Loading...</p>
              ) : customLinks.length === 0 ? (
                <div className="text-center py-8">
                  <ExternalLink className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No custom links yet</p>
                </div>
              ) : (
                customLinks.map(link => {
                  const Icon = iconMap[link.iconName] || ExternalLink;
                  return (
                    <div
                      key={link.id.toString()}
                      className="flex items-center gap-3 bg-surface-darkest border border-military-green-accent/20 px-3 py-2.5 group"
                    >
                      <div className="w-8 h-8 bg-military-green-primary border border-military-green-accent/40 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-gold-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{link.name}</p>
                        <p className="text-xs text-gray-500 truncate">{link.url}</p>
                      </div>
                      <span className="text-xs text-military-green-accent bg-military-green-primary/40 px-2 py-0.5 font-rajdhani tracking-wider">
                        {link.category}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditForm(link)}
                          className="p-1.5 text-gray-500 hover:text-gold-accent transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(link.id)}
                          disabled={deleteLink.isPending}
                          className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
            {/* Name */}
            <div>
              <label className="block text-xs font-rajdhani tracking-widest uppercase text-military-green-accent mb-1.5">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. My Bank"
                className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60 placeholder-gray-600"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
            </div>

            {/* URL */}
            <div>
              <label className="block text-xs font-rajdhani tracking-widest uppercase text-military-green-accent mb-1.5">URL</label>
              <input
                type="text"
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://example.com"
                className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60 placeholder-gray-600"
              />
              {errors.url && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.url}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-rajdhani tracking-widest uppercase text-military-green-accent mb-1.5">Category</label>
              <select
                value={useCustomCategory ? 'CUSTOM' : form.category}
                onChange={e => {
                  if (e.target.value === 'CUSTOM') {
                    setUseCustomCategory(true);
                    setForm(f => ({ ...f, category: 'CUSTOM' }));
                  } else {
                    setUseCustomCategory(false);
                    setForm(f => ({ ...f, category: e.target.value }));
                  }
                }}
                className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60"
              >
                {ALL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="CUSTOM">+ New Category</option>
              </select>
              {useCustomCategory && (
                <input
                  type="text"
                  value={form.customCategory}
                  onChange={e => setForm(f => ({ ...f, customCategory: e.target.value }))}
                  placeholder="Enter category name"
                  className="w-full mt-2 bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60 placeholder-gray-600"
                />
              )}
              {errors.category && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.category}</p>}
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-rajdhani tracking-widest uppercase text-military-green-accent mb-1.5">
                Icon — <span className="text-gold-accent normal-case">{form.iconName}</span>
              </label>
              <IconPicker selected={form.iconName} onSelect={iconName => setForm(f => ({ ...f, iconName }))} />
            </div>

            {errors.submit && (
              <div className="border border-red-500/40 bg-red-900/20 p-3 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errors.submit}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setView('list')}
                className="flex-1 bg-surface-darkest border border-military-green-accent/30 text-gray-400 hover:text-gold-accent font-rajdhani tracking-wider uppercase py-2.5 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-military-green-primary border border-gold-accent/60 text-gold-accent font-rajdhani tracking-wider uppercase py-2.5 text-sm transition-all hover:bg-military-green-accent disabled:opacity-50"
              >
                {isPending ? 'Saving...' : editingLink ? 'Update Link' : 'Add Link'}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
