import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PermissionRecord } from "@/types/api";

type PermissionsSelectorProps = {
  permissions: PermissionRecord[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  isLoading?: boolean;
  error?: string | null;
};

export function PermissionsSelector({
  permissions,
  value,
  onChange,
  disabled,
  isLoading,
  error,
}: PermissionsSelectorProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return permissions;
    return permissions.filter((permission) => {
      return (
        permission.slug.toLowerCase().includes(q) ||
        permission.name.toLowerCase().includes(q) ||
        permission.category?.toLowerCase().includes(q)
      );
    });
  }, [permissions, query]);

  const toggle = (slug: string, checked: boolean) => {
    if (checked) {
      if (!value.includes(slug)) {
        onChange([...value, slug]);
      }
    } else {
      onChange(value.filter((item) => item !== slug));
    }
  };

  const selectAll = () => {
    onChange(permissions.map((permission) => permission.slug));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search permissions…"
          disabled={disabled || isLoading}
        />
        <Badge variant="outline" className="px-2">
          {value.length} selected
        </Badge>
      </div>

      <div className="flex gap-2 text-xs text-muted-foreground">
        <button
          type="button"
          className="underline"
          onClick={selectAll}
          disabled={disabled || permissions.length === 0}
        >
          Select all
        </button>
        <span>•</span>
        <button type="button" className="underline" onClick={clearAll} disabled={disabled}>
          Clear
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <ScrollArea className="h-48 rounded-md border">
        <div className="space-y-2 p-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading permissions…</p>}
          {!isLoading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">No permissions match your search.</p>
          )}
          {filtered.map((permission) => (
            <label
              key={permission.id}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-transparent p-2 hover:border-border"
            >
              <Checkbox
                checked={value.includes(permission.slug)}
                onCheckedChange={(checked) => toggle(permission.slug, Boolean(checked))}
                disabled={disabled}
              />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{permission.name}</p>
                <p className="text-xs text-muted-foreground">{permission.slug}</p>
                {permission.description && (
                  <p className="text-xs text-muted-foreground">{permission.description}</p>
                )}
              </div>
            </label>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
