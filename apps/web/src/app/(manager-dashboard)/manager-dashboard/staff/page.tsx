'use client';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CalendarClock, Shield, Users, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const cardMotion = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function ManagerStaffPage() {
  return (
    <motion.div
      className="mx-auto max-w-4xl space-y-5 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <UserPlus size={18} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-lg font-medium tracking-tight text-fg sm:text-xl">Staff</h1>
          <p className="mt-0.5 text-sm text-muted">Branch tools for your team — coming soon.</p>
        </div>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <CalendarClock
            className="text-amber-600 dark:text-amber-400"
            size={18}
            strokeWidth={1.75}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-fg">On the roadmap</p>
            <p className="text-xs leading-relaxed text-muted">
              Invites, roles, and shifts are in development.
            </p>
          </div>
          <Badge variant="warning" className="font-normal">
            Soon
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            title: 'Invites',
            body: 'Email staff with a role for this branch.',
            icon: Users,
          },
          {
            title: 'Permissions',
            body: 'Orders, menu, and branch operations by role.',
            icon: Shield,
          },
          {
            title: 'Shifts',
            body: 'Attendance and handover notes.',
            icon: CalendarClock,
          },
        ].map((c, i) => (
          <motion.div
            key={c.title}
            custom={i}
            variants={cardMotion}
            initial="hidden"
            animate="show"
          >
            <Card className="h-full border-border/80 bg-surface/40">
              <CardHeader className="pb-1 pt-4">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-fg">
                  <c.icon size={16} strokeWidth={1.75} className="text-muted" />
                  {c.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 text-xs leading-relaxed text-muted">
                {c.body}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
