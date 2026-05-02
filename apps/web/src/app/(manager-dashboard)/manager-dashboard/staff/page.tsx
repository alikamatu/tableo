'use client';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CalendarClock, Shield, Users } from 'lucide-react';

export default function ManagerStaffPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-fg">Staff Management</h1>
        <p className="mt-1 text-sm text-muted">Branch staff tools are scheduled for July launch.</p>
      </div>

      <Card className="border-warning/40 bg-warning/5">
        <CardContent className="flex items-center gap-3 p-4">
          <CalendarClock className="text-warning" size={18} />
          <div>
            <p className="text-sm font-bold text-fg">Launching in July</p>
            <p className="text-xs text-muted">
              Invites, permissions, and shift tracking are in active development.
            </p>
          </div>
          <Badge variant="warning">July</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users size={16} /> Team invites
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted">
            Invite cashiers, servers, and kitchen staff by role.
          </CardContent>
        </Card>
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield size={16} /> Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted">
            Role-based access for orders, menu, and branch operations.
          </CardContent>
        </Card>
        <Card className="bg-surface">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarClock size={16} /> Shift logs
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted">
            Track attendance and handover notes for each shift.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
