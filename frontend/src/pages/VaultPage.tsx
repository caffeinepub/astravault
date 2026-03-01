import React, { useState, useCallback } from 'react';
import { Lock, Shield, Eye, EyeOff, AlertCircle, Plus, Search, Edit2, Trash2, X, Save, RefreshCw } from 'lucide-react';
import { useGetCallerUserProfile, useGetVaultNotes, useAddVaultNote, useEditVaultNote, useDeleteVaultNote, useResetVaultPassword } from '../hooks/useQueries';
import { hashPassword, encryptNote, decryptNote } from '../utils/encryption';
import type { VaultNote } from '../backend';

// ── Vault Unlock Screen ───────────────────────────────────────────────────────

interface VaultUnlockScreenProps {
  onUnlock: (password: string) => void;
}

function VaultUnlockScreen({ onUnlock }: VaultUnlockScreenProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const resetVaultPassword = useResetVaultPassword();

  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError('Enter your vault password'); return; }
    const hash = await hashPassword(password);
    if (hash !== userProfile?.vaultPasswordHash) {
      setError('Incorrect vault password');
      return;
    }
    onUnlock(password);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (!newPassword) { setResetError('Enter a new password'); return; }
    if (newPassword.length < 6) { setResetError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmNewPassword) { setResetError('Passwords do not match'); return; }
    try {
      const newHash = await hashPassword(newPassword);
      await resetVaultPassword.mutateAsync(newHash);
      setResetSuccess(true);
      setShowReset(false);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Reset failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-military-green-dim flex items-center justify-center mx-auto mb-4 shadow-green">
            <Lock className="w-10 h-10 text-military-green-bright" />
          </div>
          <h2 className="font-rajdhani text-2xl font-bold text-foreground tracking-wide uppercase">Private Vault</h2>
          <p className="text-muted-foreground text-sm mt-1">Enter your vault password to access encrypted notes</p>
        </div>

        {resetSuccess && (
          <div className="bg-military-green/10 border border-military-green/30 rounded p-3 text-military-green-bright text-sm mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 flex-shrink-0" />
            Vault password reset successfully.
          </div>
        )}

        {!showReset ? (
          <div className="bg-surface-1 border border-military-green/30 rounded-lg p-6 shadow-green">
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Vault Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter vault password"
                    autoFocus
                    className="w-full bg-surface-2 border border-border rounded pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green focus:ring-1 focus:ring-military-green transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && (
                  <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{error}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-military-green hover:bg-military-green-bright text-white font-rajdhani font-semibold tracking-widest uppercase py-3 rounded transition-colors"
              >
                Unlock Vault
              </button>
            </form>
            <button
              onClick={() => setShowReset(true)}
              className="w-full mt-3 text-xs text-muted-foreground hover:text-gold transition-colors text-center"
            >
              Forgot vault password? Reset it
            </button>
          </div>
        ) : (
          <div className="bg-surface-1 border border-gold/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-rajdhani font-semibold text-gold tracking-wide uppercase text-sm">Reset Vault Password</h3>
              <button onClick={() => setShowReset(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-destructive/10 border border-destructive/30 rounded p-3 text-destructive text-xs mb-4 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              Warning: Resetting your vault password will NOT re-encrypt existing notes. You will lose access to previously encrypted notes.
            </div>
            <form onSubmit={handleReset} className="space-y-3">
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New vault password"
                className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
              />
              <input
                type="password"
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
              />
              {resetError && (
                <p className="text-destructive text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{resetError}
                </p>
              )}
              <button
                type="submit"
                disabled={resetVaultPassword.isPending}
                className="w-full bg-gold/80 hover:bg-gold text-black font-rajdhani font-semibold tracking-widest uppercase py-2.5 rounded transition-colors disabled:opacity-50 text-sm"
              >
                {resetVaultPassword.isPending ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Note Card ─────────────────────────────────────────────────────────────────

interface NoteCardProps {
  note: VaultNote;
  decryptedContent: string | null;
  onEdit: (note: VaultNote, content: string) => void;
  onDelete: (noteId: bigint) => void;
  isDeleting: boolean;
}

function NoteCard({ note, decryptedContent, onEdit, onDelete, isDeleting }: NoteCardProps) {
  const date = new Date(Number(note.createdAt) / 1_000_000);
  const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="bg-surface-1 border border-border hover:border-military-green/40 rounded-lg p-4 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
            {decryptedContent ?? (
              <span className="text-muted-foreground italic text-xs">Decryption failed</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-2 font-rajdhani tracking-wider">{dateStr}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => decryptedContent && onEdit(note, decryptedContent)}
            className="p-1.5 rounded hover:bg-military-green-dim text-muted-foreground hover:text-military-green-bright transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            disabled={isDeleting}
            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Vault Notes Manager ───────────────────────────────────────────────────────

interface VaultNotesManagerProps {
  vaultPassword: string;
  onLock: () => void;
}

function VaultNotesManager({ vaultPassword, onLock }: VaultNotesManagerProps) {
  const { data: encryptedNotes = [], isLoading } = useGetVaultNotes();
  const addNote = useAddVaultNote();
  const editNote = useEditVaultNote();
  const deleteNote = useDeleteVaultNote();

  const [decryptedMap, setDecryptedMap] = useState<Record<string, string>>({});
  const [decryptError, setDecryptError] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState<{ note: VaultNote; content: string } | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [formError, setFormError] = useState('');

  // Decrypt notes when they load
  React.useEffect(() => {
    const decryptAll = async () => {
      const newMap: Record<string, string> = {};
      const newErrors: Record<string, boolean> = {};
      for (const note of encryptedNotes) {
        const key = note.id.toString();
        try {
          newMap[key] = await decryptNote(note.encryptedContent, vaultPassword);
        } catch {
          newErrors[key] = true;
        }
      }
      setDecryptedMap(newMap);
      setDecryptError(newErrors);
    };
    if (encryptedNotes.length > 0) decryptAll();
  }, [encryptedNotes, vaultPassword]);

  const filteredNotes = encryptedNotes.filter(note => {
    const content = decryptedMap[note.id.toString()] || '';
    return content.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) { setFormError('Note content is required'); return; }
    try {
      const encrypted = await encryptNote(noteContent.trim(), vaultPassword);
      await addNote.mutateAsync(encrypted);
      setNoteContent('');
      setShowAddForm(false);
      setFormError('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save note');
    }
  };

  const handleEditNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote || !noteContent.trim()) { setFormError('Note content is required'); return; }
    try {
      const encrypted = await encryptNote(noteContent.trim(), vaultPassword);
      await editNote.mutateAsync({ noteId: editingNote.note.id, encryptedContent: encrypted });
      setEditingNote(null);
      setNoteContent('');
      setFormError('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update note');
    }
  };

  const openEditForm = (note: VaultNote, content: string) => {
    setEditingNote({ note, content });
    setNoteContent(content);
    setShowAddForm(false);
    setFormError('');
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingNote(null);
    setNoteContent('');
    setFormError('');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-military-green flex items-center justify-center shadow-green">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-rajdhani text-xl font-bold text-foreground tracking-wide uppercase">Private Vault</h2>
            <p className="text-xs text-military-green-bright font-rajdhani tracking-wider">
              AES-256 Encrypted · {encryptedNotes.length} {encryptedNotes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
        </div>
        <button
          onClick={onLock}
          className="flex items-center gap-2 px-3 py-1.5 rounded border border-border hover:border-military-green/50 text-muted-foreground hover:text-foreground text-xs font-rajdhani tracking-wider uppercase transition-all"
        >
          <Lock className="w-3.5 h-3.5" />
          Lock Vault
        </button>
      </div>

      {/* Search + Add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-surface-1 border border-border rounded pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green transition-colors"
          />
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingNote(null); setNoteContent(''); setFormError(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-military-green hover:bg-military-green-bright text-white rounded text-sm font-rajdhani font-semibold tracking-wider uppercase transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Note</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingNote) && (
        <div className="bg-surface-1 border border-military-green/30 rounded-lg p-4 shadow-green">
          <h3 className="font-rajdhani font-semibold text-military-green-bright tracking-wide uppercase text-sm mb-3">
            {editingNote ? 'Edit Note' : 'New Encrypted Note'}
          </h3>
          <form onSubmit={editingNote ? handleEditNote : handleAddNote} className="space-y-3">
            <textarea
              value={noteContent}
              onChange={e => { setNoteContent(e.target.value); setFormError(''); }}
              placeholder="Write your secure note here..."
              rows={4}
              autoFocus
              className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-military-green transition-colors resize-none scrollbar-thin"
            />
            {formError && (
              <p className="text-destructive text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{formError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancelForm}
                className="flex-1 bg-surface-2 hover:bg-surface-3 border border-border text-foreground font-rajdhani tracking-wider uppercase py-2 rounded text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addNote.isPending || editNote.isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-military-green hover:bg-military-green-bright text-white font-rajdhani tracking-wider uppercase py-2 rounded text-sm transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {addNote.isPending || editNote.isPending ? 'Encrypting...' : editingNote ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2 animate-spin" />
          <p className="text-muted-foreground text-sm">Loading encrypted notes...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <Lock className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {search ? 'No notes match your search' : 'No encrypted notes yet. Add your first secure note.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map(note => (
            <NoteCard
              key={note.id.toString()}
              note={note}
              decryptedContent={decryptError[note.id.toString()] ? null : (decryptedMap[note.id.toString()] ?? null)}
              onEdit={openEditForm}
              onDelete={(id) => deleteNote.mutate(id)}
              isDeleting={deleteNote.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Vault Page ───────────────────────────────────────────────────────────

export default function VaultPage() {
  const [vaultPassword, setVaultPassword] = useState<string | null>(null);

  const handleUnlock = useCallback((password: string) => {
    setVaultPassword(password);
  }, []);

  const handleLock = useCallback(() => {
    setVaultPassword(null);
  }, []);

  if (!vaultPassword) {
    return <VaultUnlockScreen onUnlock={handleUnlock} />;
  }

  return <VaultNotesManager vaultPassword={vaultPassword} onLock={handleLock} />;
}
