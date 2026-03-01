import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useDeleteAccount } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface DeleteAccountConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteAccountConfirmationModal({
  open,
  onOpenChange,
}: DeleteAccountConfirmationModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const deleteAccount = useDeleteAccount();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await deleteAccount.mutateAsync();
      queryClient.clear();
      await clear();
    } catch (err) {
      console.error('Delete account error:', err);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-surface-1 border border-destructive/30 max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <AlertDialogTitle className="font-rajdhani text-xl text-foreground tracking-wide">
              Delete Account
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            This action <strong className="text-foreground">cannot be undone</strong>. All your data including vault notes and custom links will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2">
          <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Type <span className="text-destructive font-mono">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-destructive focus:ring-1 focus:ring-destructive transition-colors"
          />
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            onClick={() => { setConfirmText(''); onOpenChange(false); }}
            className="bg-surface-2 border-border text-foreground hover:bg-surface-3 hover:text-foreground"
          >
            Cancel
          </AlertDialogCancel>
          <button
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE' || deleteAccount.isPending}
            className="inline-flex items-center gap-2 bg-destructive hover:bg-destructive/80 text-destructive-foreground font-rajdhani tracking-wider px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            {deleteAccount.isPending ? 'Deleting...' : 'Delete Account'}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
