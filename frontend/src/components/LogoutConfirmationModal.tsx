import React from 'react';
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
import { LogOut } from 'lucide-react';

interface LogoutConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function LogoutConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
}: LogoutConfirmationModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-surface-1 border border-military-green/30 max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-military-green-dim flex items-center justify-center">
              <LogOut className="w-5 h-5 text-military-green-bright" />
            </div>
            <AlertDialogTitle className="font-rajdhani text-xl text-foreground tracking-wide">
              Confirm Logout
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            Are you sure you want to logout from AstraVault? Your session will be terminated.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="bg-surface-2 border-border text-foreground hover:bg-surface-3 hover:text-foreground">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-military-green hover:bg-military-green-bright text-white font-rajdhani tracking-wider"
          >
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
