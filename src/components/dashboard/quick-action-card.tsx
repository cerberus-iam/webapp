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
    <Card className="hover:border-primary/50 group shadow-none transition-all hover:shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-2.5 transition-colors">
            <Icon className="text-primary h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          onClick={onAction}
          variant="default"
          className="w-full justify-between"
          size="sm"
        >
          {action}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
