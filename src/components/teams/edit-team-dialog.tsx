import { useEffect, useState } from 'react';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IamApiClient } from '@/lib/api/client';
import type { Team } from '@/lib/api/teams';
import { TeamsApi } from '@/lib/api/teams';

interface EditTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team;
}

export function EditTeamDialog({
  open,
  onOpenChange,
  team,
}: EditTeamDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: team.name,
    description: team.description || '',
  });

  // Update form data when team changes
  useEffect(() => {
    setFormData({
      name: team.name,
      description: team.description || '',
    });
    setError(null);
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const client = new IamApiClient();
      const teamsApi = new TeamsApi(client);

      const result = await teamsApi.update(team.id, {
        name: formData.name,
        description: formData.description || undefined,
      });

      if (!result.ok) {
        setError(
          result.error.detail || result.error.title || 'Failed to update team'
        );
        setLoading(false);
        return;
      }

      onOpenChange(false);
      router.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team');
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
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update team details. The slug cannot be changed after creation.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label>Slug</Label>
              <Badge variant="outline" className="w-fit font-mono text-sm">
                {team.slug}
              </Badge>
              <p className="text-muted-foreground text-xs">
                The slug is immutable and cannot be changed
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                disabled={loading}
                rows={3}
              />
            </div>
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
