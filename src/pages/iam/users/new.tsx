import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { IconArrowLeft, IconUserPlus, IconEye, IconEyeOff } from '@tabler/icons-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { iamApi } from '@/lib/iam/api';
import { useIamRoles } from '@/hooks/use-iam-data';
import type { NextPageWithLayout } from '@/types/page';
import { getApiErrorMessage } from '@/lib/http';

const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  sendInvitation: z.boolean().default(false),
  roleIds: z.array(z.string()).optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

const NewUserPage: NextPageWithLayout = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { data: roles, isLoading: rolesLoading } = useIamRoles();

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      sendInvitation: false,
      roleIds: [],
    },
  });

  const sendInvitation = form.watch('sendInvitation');

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true);

    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.sendInvitation ? undefined : data.password,
        roleIds: data.roleIds,
      };

      const newUser = await iamApi.admin.users.create(payload);

      router.push(`/iam/users/${newUser.id}`);
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to create user'));
      setIsSubmitting(false);
    }
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (strength <= 4) return { label: 'Medium', color: 'bg-yellow-500', width: '66%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const currentPassword = form.watch('password');
  const strength = currentPassword ? passwordStrength(currentPassword) : null;

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
            <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
            <p className="text-muted-foreground">Add a new user account to your organization</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>User Details</CardTitle>
                  <CardDescription>Enter the basic information for the new user</CardDescription>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sendInvitation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Send Invitation Email</FormLabel>
                              <FormDescription>
                                User will receive an invitation link to set their own password. If
                                unchecked, you must set a password below.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {!sendInvitation && (
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter password"
                                    {...field}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? (
                                      <IconEyeOff className="size-4" />
                                    ) : (
                                      <IconEye className="size-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              {strength && (
                                <div className="space-y-1">
                                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                    <div
                                      className={`h-full transition-all ${strength.color}`}
                                      style={{ width: strength.width }}
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Password strength: {strength.label}
                                  </p>
                                </div>
                              )}
                              <FormDescription>
                                Must be at least 8 characters with uppercase, lowercase, and numbers
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                          <IconUserPlus className="mr-2 size-4" />
                          {isSubmitting ? 'Creating...' : 'Create User'}
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
                  <CardDescription>Assign roles to the new user</CardDescription>
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

export default NewUserPage;
