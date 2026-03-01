import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { LogOut, Shield } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

interface LogoutConfirmationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LogoutConfirmationModal({ open, onClose }: LogoutConfirmationModalProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/login' });
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="bg-surface-dark border border-military-green-accent/40 max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-gold-accent" />
            <AlertDialogTitle className="text-gold-accent font-rajdhani tracking-wider uppercase">
              Confirm Logout
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-400 font-rajdhani">
            Are you sure you want to logout? Your session will be terminated and you will need to authenticate again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onClose}
            className="bg-transparent border border-military-green-accent/40 text-gray-300 hover:bg-military-green-primary/20 hover:text-gold-accent font-rajdhani tracking-wider uppercase text-xs"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            className="bg-red-900/60 border border-red-500/40 text-red-300 hover:bg-red-900 hover:text-red-200 font-rajdhani tracking-wider uppercase text-xs flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
