import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action: string;
  onAction: () => void;
}

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  action,
  onAction,
}: QuickActionCardProps) {
  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 rounded-lg p-2">
            <Icon className="text-primary h-4 w-4" />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-sm">{description}</p>
        <Button
          onClick={onAction}
          variant="outline"
          className="w-full justify-between"
        >
          {action}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
