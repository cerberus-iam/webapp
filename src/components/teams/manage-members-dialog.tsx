import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Team } from '@/lib/api/teams';

interface ManageMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | null;
}

export function ManageMembersDialog({
  open,
  onOpenChange,
  team,
}: ManageMembersDialogProps) {
  if (!team) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Team Members</DialogTitle>
          <DialogDescription>
            Add or remove members from {team.name}
          </DialogDescription>
        </DialogHeader>
        <div className="text-muted-foreground py-8 text-center">
          <p>Team member management coming soon</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
