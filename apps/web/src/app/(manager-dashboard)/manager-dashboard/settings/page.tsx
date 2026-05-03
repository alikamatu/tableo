'use client';

import { Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';

export default function ManagerSettingsPage() {
  return (
    <motion.div
      className="mx-auto flex max-w-lg flex-col items-center px-2 py-12 text-center sm:py-16"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Settings2 size={22} strokeWidth={1.75} />
      </div>
      <h1 className="text-lg font-medium tracking-tight text-foreground">Branch settings</h1>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        Hours, contact, and profile for this branch will live here.
      </p>
      <Card className="mt-8 w-full border-border/80 bg-muted/20">
        <CardContent className="text-muted-foreground p-4 text-xs leading-relaxed">
          Configuration screens are not wired yet; use the owner dashboard for restaurant-wide
          changes where available.
        </CardContent>
      </Card>
    </motion.div>
  );
}
