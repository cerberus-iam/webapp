import { type ReactElement, useState } from "react";
import { Copy, KeyRound, ShieldCheck, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { NextPageWithLayout } from "@/types/page";
import { AppLayout } from "@/components/layout/app-layout";
import { PermissionsSelector } from "@/components/iam/permissions-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useIamApiKeys, usePermissions } from "@/hooks/use-iam-data";
import { iamApi } from "@/lib/iam/api";
import { formatRelativeTime } from "@/lib/iam";
import { getApiErrorMessage } from "@/lib/http";
import type { ApiKeySummary } from "@/types/api";

const formSchema = z.object({
  name: z.string().min(3, "Provide a descriptive name"),
  scopes: z.array(z.string()).min(1, "Select at least one scope"),
  expiresInDays: z
    .union([z.string().regex(/^\d+$/, "Must be a positive integer"), z.literal("")])
    .optional(),
});

const ApiKeysPage: NextPageWithLayout = () => {
  const { data: apiKeys, isLoading, error, refresh } = useIamApiKeys();
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {createdSecret && (
        <Alert className="border-primary/30 bg-primary/5">
          <ShieldCheck className="size-4" />
          <div>
            <AlertTitle>Copy your new API key</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center gap-3 pt-2">
              <span className="font-mono text-sm">{createdSecret}</span>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => navigator.clipboard.writeText(createdSecret)}
              >
                <Copy className="size-3" />
                Copy
              </Button>
            </AlertDescription>
          </div>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>API tokens</CardTitle>
            <CardDescription>Manage programmatic credentials for your services.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refresh()} disabled={isLoading}>
              Refresh
            </Button>
            <CreateApiKeyDialog
              onCreated={(secret) => {
                setCreatedSecret(secret ?? null);
                refresh();
              }}
              trigger={
                <Button className="gap-2">
                  <KeyRound className="size-4" />
                  Generate token
                </Button>
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Last used</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading API keys…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && apiKeys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No API keys have been created.
                  </TableCell>
                </TableRow>
              )}
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>
                    <p className="font-medium">{key.name}</p>
                    <p className="text-xs text-muted-foreground">{key.prefix}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.map((scope) => (
                        <Badge key={scope} variant="outline" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={resolveApiKeyStatus(key).variant}>
                      {resolveApiKeyStatus(key).label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {key.lastUsedAt ? formatRelativeTime(key.lastUsedAt) : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <RevokeKeyButton apiKey={key} onRevoked={refresh} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

ApiKeysPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout
      title="API Token Management"
      description="Issue, rotate, and revoke service-level credentials."
      breadcrumbs={[{ label: "Identity & Access", href: "/iam/users" }, { label: "API Tokens" }]}
      actions={
        <CreateApiKeyDialog
          trigger={
            <Button className="gap-2">
              <KeyRound className="size-4" />
              Generate token
            </Button>
          }
        />
      }
    >
      {page}
    </AppLayout>
  );
};

export default ApiKeysPage;

type CreateApiKeyDialogProps = {
  trigger?: React.ReactNode;
  onCreated?: (secret?: string) => void;
};

function CreateApiKeyDialog({ trigger, onCreated }: CreateApiKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { data: permissionDataRaw, isLoading, error } = usePermissions();
  const permissionData = permissionDataRaw ?? [];
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      scopes: [],
      expiresInDays: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    try {
      const payload: { name: string; scopes: string[]; expiresInDays?: number } = {
        name: values.name,
        scopes: values.scopes,
      };

      if (values.expiresInDays && values.expiresInDays !== "") {
        payload.expiresInDays = Number(values.expiresInDays);
      }

      try {
        const response = await iamApi.admin.apiKeys.create(payload);
        onCreated?.(response.key);
        toast.success("API key created");
        form.reset();
        setOpen(false);
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          "Unable to create API key. Please refresh and try again.",
        );
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate API key</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Production pipeline" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scopes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scopes</FormLabel>
                  <FormControl>
                    <PermissionsSelector
                      permissions={permissionData}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={submitting}
                      isLoading={isLoading}
                      error={error}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiresInDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expires in (days)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} placeholder="365" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Issuing key…" : "Create API key"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function RevokeKeyButton({ apiKey, onRevoked }: { apiKey: ApiKeySummary; onRevoked: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRevoke = async () => {
    setIsSubmitting(true);
    try {
      await iamApi.admin.apiKeys.revoke(apiKey.id);
      toast.success("API key revoked");
      onRevoked();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to revoke API key. Try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabled = Boolean(apiKey.revokedAt);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={disabled || isSubmitting}>
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke API key</AlertDialogTitle>
          <AlertDialogDescription>
            {disabled
              ? "This key is already revoked."
              : "Revoking will immediately invalidate the credential. This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRevoke} disabled={disabled || isSubmitting}>
            Revoke
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function resolveApiKeyStatus(key: ApiKeySummary) {
  if (key.revokedAt) {
    return { label: "Revoked", variant: "destructive" as const };
  }
  if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
    return { label: "Expired", variant: "outline" as const };
  }
  return { label: "Active", variant: "secondary" as const };
}
