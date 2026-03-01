import { useState } from 'react';
import { Lock, Unlock, Plus, Edit2, Trash2, Eye, EyeOff, Shield, FileText, X } from 'lucide-react';
import { useGetProfile, useGetVaultNotes, useAddVaultNote, useEditVaultNote, useDeleteVaultNote, useResetVaultPassword } from '../hooks/useQueries';
import { encryptNote, decryptNote, hashPassword } from '../utils/encryption';
import type { VaultNote } from '../backend';

export default function VaultPage() {
  const { data: userProfile } = useGetProfile();
  const { data: vaultNotes = [], isLoading: notesLoading } = useGetVaultNotes();
  const addNote = useAddVaultNote();
  const editNote = useEditVaultNote();
  const deleteNote = useDeleteVaultNote();
  const resetVaultPassword = useResetVaultPassword();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [decryptedNotes, setDecryptedNotes] = useState<Map<string, string>>(new Map());
  const [vaultPassword, setVaultPassword] = useState('');

  // Note editing state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState<VaultNote | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [formError, setFormError] = useState('');

  // Reset password state
  const [showResetForm, setShowResetForm] = useState(false);
  const [newVaultPassword, setNewVaultPassword] = useState('');
  const [confirmNewVaultPassword, setConfirmNewVaultPassword] = useState('');
  const [resetError, setResetError] = useState('');

  const handleUnlock = async () => {
    setUnlockError('');
    try {
      const hashHex = await hashPassword(passwordInput);

      if (hashHex !== userProfile?.vaultPasswordHash) {
        setUnlockError('Incorrect vault password');
        return;
      }

      setVaultPassword(passwordInput);
      setIsUnlocked(true);

      // Decrypt all notes
      const decrypted = new Map<string, string>();
      for (const note of vaultNotes) {
        try {
          const content = await decryptNote(note.encryptedContent, passwordInput);
          decrypted.set(String(note.id), content);
        } catch {
          decrypted.set(String(note.id), '[Decryption failed]');
        }
      }
      setDecryptedNotes(decrypted);
      setPasswordInput('');
    } catch {
      setUnlockError('Failed to verify password');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPasswordInput('');
    setVaultPassword('');
    setDecryptedNotes(new Map());
    setShowAddForm(false);
    setEditingNote(null);
    setShowResetForm(false);
  };

  const handleAddNote = async () => {
    setFormError('');
    if (!noteContent.trim()) { setFormError('Note content is required'); return; }

    try {
      const encrypted = await encryptNote(noteContent, vaultPassword);
      const newNote = await addNote.mutateAsync(encrypted);
      setDecryptedNotes(prev => new Map(prev).set(String(newNote.id), noteContent));
      setNoteContent('');
      setShowAddForm(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to add note');
    }
  };

  const handleEditNote = async () => {
    if (!editingNote) return;
    setFormError('');
    if (!noteContent.trim()) { setFormError('Note content is required'); return; }

    try {
      const encrypted = await encryptNote(noteContent, vaultPassword);
      await editNote.mutateAsync({ id: editingNote.id, encryptedContent: encrypted });
      setDecryptedNotes(prev => new Map(prev).set(String(editingNote.id), noteContent));
      setEditingNote(null);
      setNoteContent('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to edit note');
    }
  };

  const handleDeleteNote = async (noteId: bigint) => {
    if (!confirm('Delete this note? This action cannot be undone.')) return;
    try {
      await deleteNote.mutateAsync(noteId);
      setDecryptedNotes(prev => {
        const next = new Map(prev);
        next.delete(String(noteId));
        return next;
      });
    } catch (err: unknown) {
      console.error('Delete failed:', err);
    }
  };

  const startEdit = (note: VaultNote) => {
    setEditingNote(note);
    setNoteContent(decryptedNotes.get(String(note.id)) ?? '');
    setFormError('');
    setShowAddForm(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (newVaultPassword.length < 6) { setResetError('Password must be at least 6 characters'); return; }
    if (newVaultPassword !== confirmNewVaultPassword) { setResetError('Passwords do not match'); return; }

    try {
      // Re-encrypt all notes with new password
      const reEncrypted: { id: bigint; encrypted: string }[] = [];
      for (const [idStr, content] of decryptedNotes.entries()) {
        const encrypted = await encryptNote(content, newVaultPassword);
        reEncrypted.push({ id: BigInt(idStr), encrypted });
      }
      for (const item of reEncrypted) {
        await editNote.mutateAsync({ id: item.id, encryptedContent: item.encrypted });
      }
      const newHash = await hashPassword(newVaultPassword);
      await resetVaultPassword.mutateAsync(newHash);
      setVaultPassword(newVaultPassword);
      setNewVaultPassword('');
      setConfirmNewVaultPassword('');
      setShowResetForm(false);
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : 'Reset failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={24} style={{ color: 'var(--color-gold-accent)' }} />
          <h1
            className="font-rajdhani text-2xl font-bold tracking-wider uppercase"
            style={{ color: 'var(--color-gold-accent)' }}
          >
            Secure Vault
          </h1>
        </div>
        {isUnlocked && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetForm(!showResetForm)}
              className="flex items-center gap-2 px-3 py-2 font-rajdhani text-xs tracking-widest uppercase transition-all"
              style={{
                border: '1px solid var(--color-military-green-primary)',
                color: 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-gold-accent)';
                e.currentTarget.style.color = 'var(--color-gold-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-military-green-primary)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              Reset Password
            </button>
            <button
              onClick={handleLock}
              className="flex items-center gap-2 px-3 py-2 font-rajdhani text-xs tracking-widest uppercase transition-all"
              style={{
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#f87171',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(180,40,40,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Lock size={14} />
              Lock Vault
            </button>
          </div>
        )}
      </div>

      {/* Reset Password Form */}
      {isUnlocked && showResetForm && (
        <div
          className="p-5"
          style={{
            backgroundColor: 'var(--color-surface-dark)',
            border: '1px solid var(--color-military-green-primary)',
          }}
        >
          <h3
            className="font-rajdhani text-sm font-bold tracking-widest uppercase mb-4"
            style={{ color: 'var(--color-gold-accent)' }}
          >
            Reset Vault Password
          </h3>
          <form onSubmit={handleResetPassword} className="space-y-3">
            <div>
              <label className="block font-rajdhani text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--color-military-green-light)' }}>
                New Password
              </label>
              <input
                type="password"
                value={newVaultPassword}
                onChange={(e) => setNewVaultPassword(e.target.value)}
                placeholder="New vault password"
                className="w-full px-3 py-2 font-inter text-sm military-input"
              />
            </div>
            <div>
              <label className="block font-rajdhani text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--color-military-green-light)' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmNewVaultPassword}
                onChange={(e) => setConfirmNewVaultPassword(e.target.value)}
                placeholder="Confirm new vault password"
                className="w-full px-3 py-2 font-inter text-sm military-input"
              />
            </div>
            {resetError && (
              <p className="font-inter text-xs" style={{ color: '#f87171' }}>{resetError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={resetVaultPassword.isPending || editNote.isPending}
                className="px-4 py-2 font-rajdhani font-bold tracking-wider uppercase text-xs transition-all disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-gold-accent)',
                  color: 'var(--color-surface-darkest)',
                }}
              >
                {resetVaultPassword.isPending ? 'Resetting...' : 'Reset Password'}
              </button>
              <button
                type="button"
                onClick={() => { setShowResetForm(false); setResetError(''); }}
                className="px-4 py-2 font-rajdhani font-semibold tracking-wider uppercase text-xs transition-all"
                style={{
                  border: '1px solid var(--color-military-green-primary)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Unlock screen */}
      {!isUnlocked ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div
            className="w-20 h-20 flex items-center justify-center mb-6"
            style={{
              border: '2px solid var(--color-gold-accent)',
              backgroundColor: 'var(--color-military-green-muted)',
            }}
          >
            <Lock size={36} style={{ color: 'var(--color-gold-accent)' }} />
          </div>
          <h2
            className="font-rajdhani text-2xl font-bold tracking-widest uppercase mb-2"
            style={{ color: 'var(--color-gold-accent)' }}
          >
            Vault Locked
          </h2>
          <p className="font-inter text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Enter your vault password to access encrypted notes
          </p>

          <div
            className="w-full max-w-sm p-6"
            style={{
              backgroundColor: 'var(--color-surface-dark)',
              border: '1px solid var(--color-military-green-primary)',
            }}
          >
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="Enter vault password"
                className="w-full px-3 py-2.5 pr-10 font-inter text-sm military-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {unlockError && (
              <p className="font-inter text-xs mb-3" style={{ color: '#f87171' }}>
                {unlockError}
              </p>
            )}

            <button
              onClick={handleUnlock}
              disabled={!passwordInput}
              className="w-full py-3 font-rajdhani font-bold tracking-widest uppercase text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'var(--color-gold-accent)',
                color: 'var(--color-surface-darkest)',
              }}
            >
              <Unlock size={16} />
              Unlock Vault
            </button>
          </div>
        </div>
      ) : (
        /* Unlocked vault */
        <div className="space-y-4">
          {/* Add note button */}
          {!showAddForm && !editingNote && (
            <button
              onClick={() => { setShowAddForm(true); setNoteContent(''); setFormError(''); }}
              className="flex items-center gap-2 px-4 py-2 font-rajdhani font-bold tracking-widest uppercase text-xs transition-all"
              style={{
                border: '1px solid var(--color-military-green-primary)',
                color: 'var(--color-military-green-light)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-gold-accent)';
                e.currentTarget.style.color = 'var(--color-gold-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-military-green-primary)';
                e.currentTarget.style.color = 'var(--color-military-green-light)';
              }}
            >
              <Plus size={14} />
              Add Note
            </button>
          )}

          {/* Add/Edit form */}
          {(showAddForm || editingNote) && (
            <div
              className="p-5"
              style={{
                backgroundColor: 'var(--color-surface-dark)',
                border: '1px solid var(--color-military-green-primary)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="font-rajdhani text-sm font-bold tracking-wider uppercase"
                  style={{ color: 'var(--color-gold-accent)' }}
                >
                  {editingNote ? 'Edit Note' : 'New Note'}
                </h3>
                <button
                  onClick={() => { setShowAddForm(false); setEditingNote(null); setNoteContent(''); }}
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold-accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                >
                  <X size={16} />
                </button>
              </div>

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter your secure note..."
                rows={5}
                className="w-full px-3 py-2 font-inter text-sm military-input resize-none"
              />

              {formError && (
                <p className="font-inter text-xs mt-1" style={{ color: '#f87171' }}>{formError}</p>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={editingNote ? handleEditNote : handleAddNote}
                  disabled={addNote.isPending || editNote.isPending}
                  className="px-4 py-2 font-rajdhani font-bold tracking-widest uppercase text-xs transition-all disabled:opacity-50 flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-gold-accent)',
                    color: 'var(--color-surface-darkest)',
                  }}
                >
                  {(addNote.isPending || editNote.isPending) && (
                    <div
                      className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: 'var(--color-surface-darkest)', borderTopColor: 'transparent' }}
                    />
                  )}
                  {editingNote ? 'Save Changes' : 'Save Note'}
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setEditingNote(null); setNoteContent(''); }}
                  className="px-4 py-2 font-rajdhani font-semibold tracking-widest uppercase text-xs transition-all"
                  style={{
                    border: '1px solid var(--color-military-green-primary)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Notes list */}
          {notesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div
                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--color-gold-accent)', borderTopColor: 'transparent' }}
              />
            </div>
          ) : vaultNotes.length === 0 ? (
            <div
              className="text-center py-12"
              style={{
                border: '1px solid var(--color-military-green-muted)',
                backgroundColor: 'var(--color-surface-dark)',
              }}
            >
              <FileText size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p className="font-rajdhani tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                No vault notes yet
              </p>
              <p className="font-inter text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Add your first secure note above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vaultNotes.map((note) => (
                <div
                  key={String(note.id)}
                  className="p-4 relative group"
                  style={{
                    backgroundColor: 'var(--color-surface-dark)',
                    border: '1px solid var(--color-military-green-muted)',
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText size={14} style={{ color: 'var(--color-military-green-light)' }} />
                      <span
                        className="font-rajdhani text-xs tracking-wide uppercase"
                        style={{ color: 'var(--color-military-green-light)' }}
                      >
                        Note #{String(note.id)}
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(note)}
                        className="p-1 transition-colors"
                        style={{ color: 'var(--color-text-muted)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold-accent)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={deleteNote.isPending}
                        className="p-1 transition-colors"
                        style={{ color: 'var(--color-text-muted)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p
                    className="font-inter text-sm whitespace-pre-wrap break-words"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {decryptedNotes.get(String(note.id)) ?? '[Encrypted]'}
                  </p>
                  <p className="font-inter text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(Number(note.createdAt) / 1_000_000).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
