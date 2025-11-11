import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { IconArrowLeft, IconUserPlus, IconMail } from '@tabler/icons-react';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { iamApi } from '@/lib/iam/api';
import { useIamRoles } from '@/hooks/use-iam-data';
import type { NextPageWithLayout } from '@/types/page';
import { getApiErrorMessage } from '@/lib/http';

const inviteUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  roleIds: z.array(z.string()).optional(),
});

type InviteUserFormData = z.infer<typeof inviteUserSchema>;

const InviteUserPage: NextPageWithLayout = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { data: roles, isLoading: rolesLoading } = useIamRoles();

  const form = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      roleIds: [],
    },
  });

  const onSubmit = async (data: InviteUserFormData) => {
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      await iamApi.admin.users.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        roleIds: data.roleIds,
      });

      setSuccessMessage(
        `Invitation sent successfully to ${data.email}. They will receive an email with instructions to set up their account.`,
      );

      form.reset();

      setTimeout(() => {
        router.push('/iam/users');
      }, 3000);
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to send invitation'));
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-6">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/iam/users')}
              className="mb-2"
            >
              <IconArrowLeft className="mr-2 size-4" />
              Back to Users
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Invite User</h1>
            <p className="text-muted-foreground">Send an invitation email to a new user</p>
          </div>

          {successMessage && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
              <IconMail className="size-4" />
              <AlertTitle>Invitation Sent</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                  <CardDescription>
                    Enter the details for the user you want to invite
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john.doe@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              An invitation email will be sent to this address
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                        <div className="flex gap-2">
                          <IconMail className="mt-0.5 size-5 text-blue-600 dark:text-blue-400" />
                          <div className="text-sm text-blue-800 dark:text-blue-200">
                            <p className="font-medium">Invitation Process</p>
                            <p className="mt-1">
                              The user will receive an email with a secure link to create their
                              account and set their password. The invitation link expires after 7
                              days.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                          <IconUserPlus className="mr-2 size-4" />
                          {isSubmitting ? 'Sending...' : 'Send Invitation'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push('/iam/users')}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Role Assignment</CardTitle>
                  <CardDescription>Assign roles to the invited user</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="roleIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roles</FormLabel>
                        <div className="space-y-2">
                          {rolesLoading ? (
                            <p className="text-sm text-muted-foreground">Loading roles...</p>
                          ) : roles && roles.length > 0 ? (
                            roles.map((role) => (
                              <div key={role.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={role.id}
                                  checked={field.value?.includes(role.id)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValues, role.id]);
                                    } else {
                                      field.onChange(currentValues.filter((id) => id !== role.id));
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={role.id}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {role.name}
                                  {role.description && (
                                    <span className="block text-xs text-muted-foreground">
                                      {role.description}
                                    </span>
                                  )}
                                </label>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No roles available</p>
                          )}
                        </div>
                        <FormDescription>Select one or more roles for this user</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default InviteUserPage;
