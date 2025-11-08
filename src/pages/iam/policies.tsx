import { type ReactElement, useState } from "react";
import { FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import type { NextPageWithLayout } from "@/types/page";
import { AppLayout } from "@/components/layout/app-layout";
import { PermissionsSelector } from "@/components/iam/permissions-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePermissions } from "@/hooks/use-iam-data";

const policySchema = z.object({
  name: z.string().min(3, "Enter a policy name"),
  description: z.string().optional(),
  effect: z.enum(["allow", "deny"]),
  scopes: z.array(z.string()).min(1, "Choose at least one permission"),
});

const PoliciesPage: NextPageWithLayout = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const { data: rawPermissions, isLoading, error } = usePermissions();
  const permissions = rawPermissions ?? [];

  const form = useForm<z.infer<typeof policySchema>>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      name: "",
      description: "",
      effect: "allow",
      scopes: [],
    },
  });

  const onSubmit = (values: z.infer<typeof policySchema>) => {
    setPreview(
      JSON.stringify(
        {
          version: "2025-01-01",
          statement: [
            {
              effect: values.effect,
              actions: values.scopes,
              description: values.description,
            },
          ],
        },
        null,
        2,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Policy workspace</CardTitle>
          <CardDescription>
            Draft fine-grained policies using the same permission catalog that powers API keys and
            roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy name</FormLabel>
                    <FormControl>
                      <Input placeholder="Tenant admin read access" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Optional notes…" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="effect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effect</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose effect" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="allow">Allow</SelectItem>
                        <SelectItem value="deny">Deny</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scopes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permissions</FormLabel>
                    <FormControl>
                      <PermissionsSelector
                        permissions={permissions}
                        value={field.value}
                        onChange={field.onChange}
                        isLoading={isLoading}
                        error={error}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Generate policy preview
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {preview && (
        <Alert className="overflow-auto whitespace-pre-wrap">
          <AlertTitle>Policy preview</AlertTitle>
          <AlertDescription>
            <pre className="mt-2 text-xs">{preview}</pre>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

PoliciesPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout
      title="Policy Authoring"
      description="Design guardrails, simulate blast radius, and ship permission changes safely."
      breadcrumbs={[{ label: "Identity & Access", href: "/iam/users" }, { label: "Policies" }]}
      actions={
        <Button className="gap-2">
          <FileText className="size-4" />
          New policy draft
        </Button>
      }
    >
      {page}
    </AppLayout>
  );
};

export default PoliciesPage;
