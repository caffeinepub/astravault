import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
      <AlertDialogContent
        style={{
          backgroundColor: 'var(--color-surface-dark)',
          border: '1px solid var(--color-military-green-primary)',
          borderRadius: '0px',
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            className="font-rajdhani text-xl tracking-wider uppercase"
            style={{ color: 'var(--color-gold-accent)' }}
          >
            Confirm Logout
          </AlertDialogTitle>
          <AlertDialogDescription
            className="font-inter text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Are you sure you want to log out of AstraVault? Your session will be terminated.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="font-rajdhani font-semibold tracking-wider uppercase text-sm"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--color-military-green-primary)',
              color: 'var(--color-text-secondary)',
              borderRadius: '0px',
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="font-rajdhani font-bold tracking-wider uppercase text-sm"
            style={{
              backgroundColor: 'var(--color-gold-accent)',
              color: 'var(--color-surface-darkest)',
              borderRadius: '0px',
            }}
          >
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
