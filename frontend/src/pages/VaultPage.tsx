import React, { useState } from 'react';
import { Lock, Unlock, Plus, Edit2, Trash2, Eye, EyeOff, Shield, FileText, X } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useGetCallerUserProfile, useGetVaultNotes, useAddVaultNote, useEditVaultNote, useDeleteVaultNote } from '../hooks/useQueries';
import { encryptNote, decryptNote } from '../utils/encryption';
import type { VaultNote } from '../backend';

export default function VaultPage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: vaultNotes = [], isLoading: notesLoading } = useGetVaultNotes();
  const addNote = useAddVaultNote();
  const editNote = useEditVaultNote();
  const deleteNote = useDeleteVaultNote();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [decryptedNotes, setDecryptedNotes] = useState<Map<string, string>>(new Map());

  // Note editing state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState<VaultNote | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [formError, setFormError] = useState('');
  const [vaultPassword, setVaultPassword] = useState('');

  const handleUnlock = async () => {
    setUnlockError('');
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(passwordInput);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

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
  };

  const handleAddNote = async () => {
    setFormError('');
    if (!noteContent.trim()) { setFormError('Note content is required'); return; }

    try {
      const encrypted = await encryptNote(noteContent, vaultPassword);
      await addNote.mutateAsync(encrypted);
      setNoteContent('');
      setShowAddForm(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add note');
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
    } catch (err: any) {
      setFormError(err.message || 'Failed to edit note');
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
    } catch (err: any) {
      console.error('Delete failed:', err);
    }
  };

  const startEdit = (note: VaultNote) => {
    setEditingNote(note);
    setNoteContent(decryptedNotes.get(String(note.id)) ?? '');
    setFormError('');
    setShowAddForm(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-gold-accent" />
            <h1 className="font-rajdhani text-2xl font-bold text-gold-accent tracking-wider uppercase">
              Secure Vault
            </h1>
          </div>
          {isUnlocked && (
            <button
              onClick={handleLock}
              className="flex items-center gap-2 px-4 py-2 border border-red-500/40 text-red-400 hover:bg-red-900/20 transition-colors text-xs font-rajdhani tracking-widest uppercase"
            >
              <Lock className="w-3.5 h-3.5" />
              Lock Vault
            </button>
          )}
        </div>

        {/* Unlock screen */}
        {!isUnlocked ? (
          <div className="max-w-md mx-auto">
            <div className="border border-military-green-accent/40 bg-surface-dark/60 p-8 relative">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-accent to-transparent" />

              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 bg-military-green-primary border border-gold-accent/60 flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-gold-accent" />
                </div>
                <h2 className="font-rajdhani text-xl font-bold text-gold-accent tracking-wider uppercase">
                  Vault Locked
                </h2>
                <p className="text-gray-400 text-sm font-rajdhani mt-1">
                  Enter your vault password to access notes
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                    placeholder="Enter vault password"
                    className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 pr-10 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60 placeholder-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold-accent transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {unlockError && (
                  <p className="text-red-400 text-xs font-rajdhani">{unlockError}</p>
                )}

                <button
                  onClick={handleUnlock}
                  className="w-full py-3 bg-military-green-primary border border-gold-accent/60 text-gold-accent font-rajdhani font-bold text-sm tracking-widest uppercase hover:bg-military-green-accent transition-all flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  Unlock Vault
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Unlocked vault */
          <div className="space-y-4">
            {/* Add note button */}
            {!showAddForm && !editingNote && (
              <button
                onClick={() => { setShowAddForm(true); setNoteContent(''); setFormError(''); }}
                className="flex items-center gap-2 px-4 py-2 border border-military-green-accent/40 text-military-green-accent hover:text-gold-accent hover:border-gold-accent/40 transition-colors text-xs font-rajdhani tracking-widest uppercase"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Note
              </button>
            )}

            {/* Add/Edit form */}
            {(showAddForm || editingNote) && (
              <div className="border border-military-green-accent/40 bg-surface-dark/60 p-4 relative">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gold-accent font-rajdhani text-sm tracking-wider uppercase font-bold">
                    {editingNote ? 'Edit Note' : 'New Note'}
                  </h3>
                  <button
                    onClick={() => { setShowAddForm(false); setEditingNote(null); setNoteContent(''); }}
                    className="text-gray-500 hover:text-gold-accent transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Enter your secure note..."
                  rows={5}
                  className="w-full bg-surface-darkest border border-military-green-accent/40 text-gray-200 px-3 py-2 text-sm font-rajdhani focus:outline-none focus:border-gold-accent/60 placeholder-gray-600 resize-none"
                />

                {formError && (
                  <p className="text-red-400 text-xs font-rajdhani mt-1">{formError}</p>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={editingNote ? handleEditNote : handleAddNote}
                    disabled={addNote.isPending || editNote.isPending}
                    className="px-4 py-2 bg-military-green-primary border border-gold-accent/60 text-gold-accent font-rajdhani text-xs tracking-widest uppercase hover:bg-military-green-accent transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {(addNote.isPending || editNote.isPending) && (
                      <div className="w-3 h-3 border border-gold-accent border-t-transparent rounded-full animate-spin" />
                    )}
                    {editingNote ? 'Save Changes' : 'Save Note'}
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setEditingNote(null); setNoteContent(''); }}
                    className="px-4 py-2 border border-military-green-accent/30 text-gray-400 hover:text-gold-accent font-rajdhani text-xs tracking-widest uppercase transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Notes list */}
            {notesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-gold-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : vaultNotes.length === 0 ? (
              <div className="text-center py-12 border border-military-green-accent/20 bg-surface-dark/40">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 font-rajdhani tracking-wide">No vault notes yet</p>
                <p className="text-gray-600 text-xs font-rajdhani mt-1">Add your first secure note above</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vaultNotes.map((note) => (
                  <div
                    key={String(note.id)}
                    className="border border-military-green-accent/20 bg-surface-dark/60 p-4 relative group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-military-green-accent" />
                        <span className="text-military-green-accent text-xs font-rajdhani tracking-wide uppercase">
                          Note #{String(note.id)}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(note)}
                          className="p-1 text-gray-500 hover:text-gold-accent transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          disabled={deleteNote.isPending}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm font-rajdhani whitespace-pre-wrap break-words">
                      {decryptedNotes.get(String(note.id)) ?? '[Encrypted]'}
                    </p>
                    <p className="text-gray-600 text-xs font-rajdhani mt-2">
                      {new Date(Number(note.createdAt) / 1_000_000).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
