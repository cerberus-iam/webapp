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
import type { UpdateUserRequest } from '@/lib/api/users';
import { UsersApi } from '@/lib/api/users';
import type { User } from '@/types/iam';

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const usersApi = new UsersApi(apiClient);

export function EditUserDialog({
  user,
  open,
  onOpenChange,
}: EditUserDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});

  const [formData, setFormData] = useState<UpdateUserRequest>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Initialize form with user data when dialog opens
  useEffect(() => {
    if (user && open) {
      setFormData({
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
      setFormError(null);
      setFieldErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, open]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!user) return;

      setIsSubmitting(true);
      setFormError(null);
      setFieldErrors({});

      const result = await usersApi.update(user.id, formData);

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
    [formData, onOpenChange, router, user]
  );

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Changes will be reflected immediately.
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

            <Field data-invalid={Boolean(fieldErrors.email?.length)}>
              <FieldLabel htmlFor="edit-email">Email</FieldLabel>
              <Input
                id="edit-email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              {fieldErrors.email?.map((error, i) => (
                <FieldError key={i}>{error}</FieldError>
              ))}
            </Field>

            <Field data-invalid={Boolean(fieldErrors.firstName?.length)}>
              <FieldLabel htmlFor="edit-firstName">First Name</FieldLabel>
              <Input
                id="edit-firstName"
                type="text"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              {fieldErrors.firstName?.map((error, i) => (
                <FieldError key={i}>{error}</FieldError>
              ))}
            </Field>

            <Field data-invalid={Boolean(fieldErrors.lastName?.length)}>
              <FieldLabel htmlFor="edit-lastName">Last Name</FieldLabel>
              <Input
                id="edit-lastName"
                type="text"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
              {fieldErrors.lastName?.map((error, i) => (
                <FieldError key={i}>{error}</FieldError>
              ))}
            </Field>

            <Field data-invalid={Boolean(fieldErrors.phone?.length)}>
              <FieldLabel htmlFor="edit-phone">Phone</FieldLabel>
              <Input
                id="edit-phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              {fieldErrors.phone?.map((error, i) => (
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
