'use client';

import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { extractFieldErrors, getProblemMessage } from '@/lib/api/error-utils';
import type { FieldErrorMap } from '@/lib/api/error-utils';
import type { Role, UpdateRoleRequest } from '@/lib/api/roles';
import { RolesApi } from '@/lib/api/roles';

interface EditRoleDialogProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const rolesApi = new RolesApi(apiClient);

export function EditRoleDialog({
  role,
  open,
  onOpenChange,
}: EditRoleDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});

  const [formData, setFormData] = useState<UpdateRoleRequest>({
    name: '',
    description: '',
  });

  // Initialize form with role data when dialog opens
  useEffect(() => {
    if (role && open) {
      setFormData({
        name: role.name,
        description: role.description || '',
      });
      setFormError(null);
      setFieldErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role?.id, open]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!role) return;

      setIsSubmitting(true);
      setFormError(null);
      setFieldErrors({});

      const result = await rolesApi.update(role.id, formData);

      if (result.ok) {
        onOpenChange(false);
        router.replace(router.asPath);
      } else {
        const problem = result.error;
        const errors = extractFieldErrors(problem);
        setFieldErrors(errors);

        const messageFromErrors = errors.form?.[0];
        setFormError(messageFromErrors ?? getProblemMessage(problem));
      }

      setIsSubmitting(false);
    },
    [formData, onOpenChange, router, role]
  );

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role information. The slug cannot be changed.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            {formError && (
              <div
                role="alert"
                className="border-destructive text-destructive bg-destructive/10 rounded-md border px-3 py-2 text-sm"
              >
                {formError}
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="edit-slug">Slug</FieldLabel>
              <Input
                id="edit-slug"
                type="text"
                disabled
                value={role.slug}
                className="bg-muted"
              />
              <p className="text-muted-foreground text-xs">
                Slug cannot be changed after creation
              </p>
            </Field>

            <Field data-invalid={Boolean(fieldErrors.name?.length)}>
              <FieldLabel htmlFor="edit-name">Role Name</FieldLabel>
              <Input
                id="edit-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {fieldErrors.name?.map((error, i) => (
                <FieldError key={i}>{error}</FieldError>
              ))}
            </Field>

            <Field data-invalid={Boolean(fieldErrors.description?.length)}>
              <FieldLabel htmlFor="edit-description">Description</FieldLabel>
              <Input
                id="edit-description"
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              {fieldErrors.description?.map((error, i) => (
                <FieldError key={i}>{error}</FieldError>
              ))}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
