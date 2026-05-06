'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Loader2,
  Plus,
  Users,
  UserMinus,
  Mail,
  ShieldCheck,
  UserCog,
  UtensilsCrossed,
} from 'lucide-react';
import { useAppSelector } from '@/stores/store';
import api from '@/lib/api';
import { inviteStaffSchema } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalTrigger,
} from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import * as React from 'react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface StaffMember {
  id: string;
  role: string;
  isActive: boolean;
  invitedAt: string;
  user: { id: string; email: string; fullName: string; phone?: string };
}

const ROLE_CONFIG: Record<
  string,
  { color: 'primary' | 'warning' | 'success' | 'danger'; icon: any }
> = {
  manager: { color: 'primary', icon: ShieldCheck },
  cashier: { color: 'warning', icon: UserCog },
  kitchen: { color: 'success', icon: UtensilsCrossed },
};

export default function StaffPage() {
  const { current: branch } = useAppSelector((s) => s.branch);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({ email: '', role: '' });
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const containerRef = useRef(null);

  const load = useCallback(async () => {
    if (!branch) return;
    try {
      const { data } = await api.get(`/branches/${branch.id}/staff`);
      setStaff(data.data);
    } catch {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  }, [branch]);

  useEffect(() => {
    load();
  }, [load]);

  const handleInvite = async () => {
    const result = inviteStaffSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Invalid');
      return;
    }
    if (!branch) return;

    setInviting(true);
    try {
      await api.post(`/branches/${branch.id}/staff`, form);
      toast.success('Invitation sent');
      setForm({ email: '', role: '' });
      setInviteOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to invite');
    } finally {
      setInviting(false);
    }
  };

  const toggleActive = async (member: StaffMember) => {
    if (!branch) return;
    setTogglingId(member.id);
    try {
      await api.patch(`/branches/${branch.id}/staff/${member.id}`, {
        isActive: !member.isActive,
      });
      setStaff((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, isActive: !m.isActive } : m)),
      );
    } catch {
      toast.error('Sync failed');
    } finally {
      setTogglingId(null);
    }
  };

  const removeMember = async (member: StaffMember) => {
    if (!branch) return;
    setRemovingId(member.id);
    try {
      await api.delete(`/branches/${branch.id}/staff/${member.id}`);
      toast.success('Member removed');
      load();
    } catch {
      toast.error('Action failed');
    } finally {
      setRemovingId(null);
    }
  };

  if (!branch)
    return (
      <div className="py-20 text-center font-medium text-muted-foreground">
        Select a branch to manage team.
      </div>
    );

  return (
    <div ref={containerRef}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Team Settings</h1>
          <p className="mt-1 font-medium text-muted-foreground">
            Control access and roles for{' '}
            <span className="font-bold text-foreground">{branch.name}</span>
          </p>
        </div>

        <Modal open={inviteOpen} onOpenChange={setInviteOpen}>
          <ModalTrigger asChild>
            <Button startContent={<Plus size={18} />}>Invite Member</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>New Invitation</ModalTitle>
            </ModalHeader>
            <div className="space-y-4 py-4">
              <Input
                label="Email Address"
                placeholder="staff@example.com"
                value={form.email}
                onValueChange={(v) => setForm((f) => ({ ...f, email: v }))}
                autoFocus
              />
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="kitchen">Kitchen Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ModalFooter>
              <Button variant="muted" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button loading={inviting} onClick={handleInvite}>
                Send Invite
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={28} strokeWidth={1.75} />
        </div>
      ) : staff.length === 0 ? (
        <Card className="staff-card border-dashed p-20 text-center">
          <CardContent className="flex flex-col items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Users size={32} />
            </div>
            <p className="text-xl font-bold text-foreground">You are currently solo</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => {
            const cfg = ROLE_CONFIG[member.role] || { color: 'primary', icon: UserCog };
            const Icon = cfg.icon;
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="staff-card group overflow-hidden border-border transition-all hover:shadow-md active:scale-[0.99]">
                  <CardContent className="space-y-6 pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted text-xl font-black text-primary shadow-sm">
                        {member.user.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-foreground">{member.user.fullName}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <Mail size={12} className="text-primary/60" />
                          <span className="truncate">{member.user.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted p-3.5 transition-colors group-hover:bg-accent">
                      <div className="flex items-center gap-2">
                        <Icon
                          size={14}
                          className={cn(
                            member.isActive ? 'text-primary' : 'text-muted-foreground/50',
                          )}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {member.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'text-[8px] font-black uppercase tracking-widest transition-colors',
                            member.isActive ? 'text-green-600' : 'text-muted-foreground/40',
                          )}
                        >
                          {member.isActive ? 'Active' : 'Muted'}
                        </span>
                        <Switch
                          checked={member.isActive}
                          onCheckedChange={() => toggleActive(member)}
                          disabled={togglingId === member.id}
                          className="scale-90"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[10px] font-bold italic text-muted-foreground/40">
                        Joined {new Date(member.invitedAt).toLocaleDateString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2 px-3 text-[10px] font-bold uppercase tracking-tight text-destructive/60 hover:bg-destructive/10 hover:text-destructive"
                        loading={removingId === member.id}
                        startContent={removingId !== member.id && <UserMinus size={14} />}
                        onClick={() => removeMember(member)}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
