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
import type { CreateUserRequest } from '@/lib/api/users';
import { UsersApi } from '@/lib/api/users';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const usersApi = new UsersApi(apiClient);

export function CreateUserDialog({
  open,
  onOpenChange,
}: CreateUserDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});

  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    roleIds: [],
  });

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setIsSubmitting(true);
      setFormError(null);
      setFieldErrors({});

      const result = await usersApi.create(formData);

      if (result.ok) {
        // Success - close dialog and refresh
        onOpenChange(false);
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          roleIds: [],
        });
        router.replace(router.asPath); // Refresh server-side props
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
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to your organization. They will receive an email to
              verify their account.
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
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
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
              <FieldLabel htmlFor="firstName">First Name</FieldLabel>
              <Input
                id="firstName"
                type="text"
                autoComplete="given-name"
                required
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
              <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
              <Input
                id="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
              {fieldErrors.lastName?.map((error, i) => (
                <FieldError key={i}>{error}</FieldError>
              ))}
            </Field>

            <Field data-invalid={Boolean(fieldErrors.password?.length)}>
              <FieldLabel htmlFor="password">Initial Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              {fieldErrors.password?.map((error, i) => (
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
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
