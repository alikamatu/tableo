'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, 
  Users, 
  UserMinus, 
  Mail, 
  ShieldCheck, 
  UserCog,
  UtensilsCrossed
} from 'lucide-react';
import { useAppSelector } from '@/stores/store';
import api from '@/lib/api';
import { inviteStaffSchema } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalTrigger,
} from '@/components/ui/Modal';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
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

const ROLE_CONFIG: Record<string, { color: 'primary' | 'warning' | 'success' | 'danger'; icon: any }> = {
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

  useGSAP(() => {
    if (!loading) {
      gsap.from('.staff-card', {
        scale: 0.98,
        opacity: 0,
        y: 5,
        stagger: 0.03,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }, [loading]);

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
    try {
      await api.patch(`/branches/${branch.id}/staff/${member.id}`, {
        isActive: !member.isActive,
      });
      setStaff(prev => prev.map(m => m.id === member.id ? { ...m, isActive: !m.isActive } : m));
    } catch {
      toast.error('Sync failed');
    }
  };

  const removeMember = async (member: StaffMember) => {
    if (!branch) return;
    try {
      await api.delete(`/branches/${branch.id}/staff/${member.id}`);
      toast.success('Member removed');
      load();
    } catch {
      toast.error('Action failed');
    }
  };

  if (!branch) return <div className="text-center py-20 text-muted-foreground font-medium">Select a branch to manage team.</div>;

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Team Settings</h1>
          <p className="text-muted-foreground mt-1 font-medium">Control access and roles for <span className="text-foreground font-bold">{branch.name}</span></p>
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
                onValueChange={(v) => setForm(f => ({ ...f, email: v }))}
                autoFocus
              />
              <Select 
                value={form.role} 
                onValueChange={(v) => setForm(f => ({ ...f, role: v }))}
              >
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
              <Button variant="muted" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button loading={inviting} onClick={handleInvite}>Send Invite</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      {staff.length === 0 && !loading ? (
        <Card className="p-20 text-center staff-card border-dashed">
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
              <Card key={member.id} className="staff-card group border-border hover:shadow-md transition-all active:scale-[0.99] overflow-hidden">
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary font-black text-xl shadow-sm">
                      {member.user.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">{member.user.fullName}</p>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mt-1">
                        <Mail size={12} className="text-primary/60" />
                        <span className="truncate">{member.user.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted border border-border group-hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={cn(member.isActive ? "text-primary" : "text-muted-foreground/50")} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{member.role}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-[8px] uppercase font-black tracking-widest transition-colors", member.isActive ? "text-green-600" : "text-muted-foreground/40")}>
                        {member.isActive ? 'Active' : 'Muted'}
                      </span>
                      <Switch 
                        checked={member.isActive} 
                        onCheckedChange={() => toggleActive(member)} 
                        className="scale-90"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[10px] font-bold text-muted-foreground/40 italic">Joined {new Date(member.invitedAt).toLocaleDateString()}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 text-destructive/60 hover:bg-destructive/10 hover:text-destructive gap-2 text-[10px] font-bold uppercase tracking-tight"
                      onClick={() => removeMember(member)}
                    >
                      <UserMinus size={14} /> Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
