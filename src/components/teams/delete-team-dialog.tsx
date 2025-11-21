import { useState } from 'react';

import { useRouter } from 'next/router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IamApiClient } from '@/lib/api/client';
import type { Team } from '@/lib/api/teams';
import { TeamsApi } from '@/lib/api/teams';

interface DeleteTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team;
}

export function DeleteTeamDialog({
  open,
  onOpenChange,
  team,
}: DeleteTeamDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setLoading(true);

    try {
      const client = new IamApiClient();
      const teamsApi = new TeamsApi(client);

      const result = await teamsApi.delete(team.id);

      if (!result.ok) {
        setError(
          result.error.detail || result.error.title || 'Failed to delete team'
        );
        setLoading(false);
        return;
      }

      onOpenChange(false);
      router.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team');
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Team</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this team? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Team:</span>
              <span className="text-sm">{team.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Slug:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {team.slug}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Members:</span>
              <span className="text-sm">{team.memberCount}</span>
            </div>
          </div>

          {team.memberCount > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/50">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                <strong>Warning:</strong> This team has {team.memberCount}{' '}
                member
                {team.memberCount === 1 ? '' : 's'}. Deleting the team will
                remove all members from it.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Team'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
