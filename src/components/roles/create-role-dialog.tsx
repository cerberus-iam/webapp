'use client';

import { useCallback, useState } from 'react';

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
import type { CreateRoleRequest } from '@/lib/api/roles';
import { RolesApi } from '@/lib/api/roles';

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const rolesApi = new RolesApi(apiClient);

export function CreateRoleDialog({
  open,
  onOpenChange,
}: CreateRoleDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});

  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: '',
    description: '',
    permissionIds: [], // API expects permissionIds, not permissions
  });

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setIsSubmitting(true);
      setFormError(null);
      setFieldErrors({});

      const result = await rolesApi.create(formData);

      if (result.ok) {
        onOpenChange(false);
        setFormData({
          name: '',
          description: '',
          permissionIds: [], // API expects permissionIds, not permissions
        });
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
    [formData, onOpenChange, router]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Create a new role to group permissions and assign to users.
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

            <Field data-invalid={Boolean(fieldErrors.name?.length)}>
              <FieldLabel htmlFor="name">Role Name</FieldLabel>
              <Input
                id="name"
                type="text"
                required
                placeholder="e.g., Developer, Manager"
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
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Input
                id="description"
                type="text"
                placeholder="Brief description of this role"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <p className="text-muted-foreground text-xs">
                A unique slug will be automatically generated from the role name
              </p>
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
              {isSubmitting ? 'Creating...' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
