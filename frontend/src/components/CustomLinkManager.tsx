import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, ExternalLink, AlertCircle, X } from 'lucide-react';
import { useGetCustomLinks, useAddCustomLink, useEditCustomLink, useDeleteCustomLink } from '../hooks/useQueries';
import { ICON_MAP, ALL_CATEGORIES } from '../data/defaultLinks';
import IconPicker from './IconPicker';
import type { CustomLink } from '../backend';

interface CustomLinkManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export default function CustomLinkManager({ open, onOpenChange }: CustomLinkManagerProps) {
  const { data: customLinks = [], isLoading } = useGetCustomLinks();
  const addLink = useAddCustomLink();
  const editLink = useEditCustomLink();
  const deleteLink = useDeleteCustomLink();

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingLink, setEditingLink] = useState<CustomLink | null>(null);
  const [form, setForm] = useState<LinkForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  useEffect(() => {
    if (!open) {
      setView('list');
      setEditingLink(null);
      setForm(emptyForm);
      setErrors({});
    }
  }, [open]);

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
          linkId: editingLink.id,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-1 border border-military-green/30 max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-rajdhani text-xl text-gold tracking-wide uppercase flex items-center gap-2">
            {view === 'list' ? (
              <><Plus className="w-5 h-5" /> Manage Custom Links</>
            ) : (
              <><Edit2 className="w-5 h-5" /> {editingLink ? 'Edit Link' : 'Add New Link'}</>
            )}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            {view === 'list' ? 'Add, edit, or remove your custom quick-access links.' : 'Fill in the details for your custom link.'}
          </DialogDescription>
        </DialogHeader>

        {view === 'list' ? (
          <div className="flex flex-col gap-3 overflow-hidden">
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 w-full bg-military-green-dim hover:bg-military-green text-military-green-bright hover:text-white border border-military-green/40 rounded px-4 py-2.5 text-sm font-rajdhani font-semibold tracking-wider uppercase transition-all"
            >
              <Plus className="w-4 h-4" />
              Add New Link
            </button>

            <div className="overflow-y-auto scrollbar-thin flex-1 space-y-2 pr-1">
              {isLoading ? (
                <p className="text-muted-foreground text-sm text-center py-4">Loading...</p>
              ) : customLinks.length === 0 ? (
                <div className="text-center py-8">
                  <ExternalLink className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No custom links yet</p>
                </div>
              ) : (
                customLinks.map(link => {
                  const Icon = ICON_MAP[link.iconName] || ExternalLink;
                  return (
                    <div
                      key={link.id.toString()}
                      className="flex items-center gap-3 bg-surface-2 border border-border rounded px-3 py-2.5 group"
                    >
                      <div className="w-8 h-8 rounded bg-military-green-dim flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-military-green-bright" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{link.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                      </div>
                      <span className="text-xs text-gold-dim bg-surface-3 px-2 py-0.5 rounded font-rajdhani tracking-wider">
                        {link.category}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditForm(link)}
                          className="p-1.5 rounded hover:bg-military-green-dim text-muted-foreground hover:text-military-green-bright transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(link.id)}
                          disabled={deleteLink.isPending}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
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
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto scrollbar-thin pr-1">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. My Bank"
                className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green transition-colors"
              />
              {errors.name && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
            </div>

            {/* URL */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">URL</label>
              <input
                type="text"
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://example.com"
                className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green transition-colors"
              />
              {errors.url && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.url}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Category</label>
              <div className="flex gap-2">
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
                  className="flex-1 bg-surface-2 border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-military-green transition-colors"
                >
                  {ALL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="CUSTOM">+ New Category</option>
                </select>
              </div>
              {useCustomCategory && (
                <input
                  type="text"
                  value={form.customCategory}
                  onChange={e => setForm(f => ({ ...f, customCategory: e.target.value }))}
                  placeholder="Enter category name"
                  className="w-full mt-2 bg-surface-2 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green transition-colors"
                />
              )}
              {errors.category && <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.category}</p>}
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Icon — <span className="text-military-green-bright normal-case">{form.iconName}</span>
              </label>
              <IconPicker selected={form.iconName} onSelect={iconName => setForm(f => ({ ...f, iconName }))} />
            </div>

            {errors.submit && (
              <div className="bg-destructive/10 border border-destructive/30 rounded p-3 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errors.submit}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setView('list')}
                className="flex-1 bg-surface-2 hover:bg-surface-3 border border-border text-foreground font-rajdhani tracking-wider uppercase py-2.5 rounded text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-military-green hover:bg-military-green-bright text-white font-rajdhani tracking-wider uppercase py-2.5 rounded text-sm transition-colors disabled:opacity-50"
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
