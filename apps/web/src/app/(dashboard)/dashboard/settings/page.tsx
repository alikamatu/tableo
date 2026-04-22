'use client';

import { useState, useEffect } from 'react';
import { 
  Crown, CreditCard, User as UserIcon, Building2, Check, 
  ChevronRight, ShieldCheck, Zap, Gem, Lock
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/stores/store';
import { updateRestaurant } from '@/stores/restaurantSlice';
import { initAuth } from '@/stores/authSlice';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as React from 'react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const PLAN_FEATURES: Record<string, { desc: string; icon: any; features: string[] }> = {
  starter: { desc: 'Perfect for single locations', icon: Zap, features: ['1 branch', 'Basic menu', 'QR ordering'] },
  pro: { desc: 'For growing restaurant groups', icon: Crown, features: ['Up to 3 branches', 'Analytics', 'Staff management', 'Priority support'] },
  business: { desc: 'Unlimited scale & enterprise features', icon: Gem, features: ['Unlimited branches', 'Advanced analytics', 'API access', 'Dedicated support'] },
};

const TABS = [
  { id: 'profile', label: 'Personal Profile', icon: UserIcon },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Lock }
];

export default function SettingsPage() {
  const { current: restaurant } = useAppSelector((s) => s.restaurant);
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');

  // Org Form
  const [orgData, setOrgData] = useState({
    name: '', description: '', phone: '', email: '', address: '', city: '', currency: ''
  });

  // Security Form
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '' });

  // Billing Form
  const [billingData, setBillingData] = useState({
    paystackPublicKey: '', paystackSecretKey: '', settlementType: 'bank', settlementBank: '', settlementAccountNumber: ''
  });

  const containerRef = React.useRef(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.fullName || '');
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (restaurant) {
      setOrgData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        address: restaurant.address || '',
        city: restaurant.city || '',
        currency: restaurant.currency || 'GHS',
      });
      setBillingData({
        paystackPublicKey: restaurant.paystackPublicKey || '',
        paystackSecretKey: restaurant.paystackSecretKey || '',
        settlementType: restaurant.settlementType || 'bank',
        settlementBank: restaurant.settlementBank || '',
        settlementAccountNumber: restaurant.settlementAccountNumber || '',
      });
    }
  }, [restaurant]);

  useGSAP(() => {
    gsap.from('.settings-reveal', { opacity: 0, y: 10, stagger: 0.05, duration: 0.4, ease: 'power3.out' });
  }, { scope: containerRef, dependencies: [activeTab] });

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await api.patch('/auth/profile', { fullName: profileName, phone: profilePhone });
      await dispatch(initAuth());
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      await api.post('/auth/change-password', passData);
      setPassData({ oldPassword: '', newPassword: '' });
      toast.success('Password changed successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrg = async () => {
    if (!restaurant) return;
    setLoading(true);
    try {
      await dispatch(updateRestaurant({ id: restaurant.id, ...orgData })).unwrap();
      toast.success('Organization updated');
    } catch {
      toast.error('Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBilling = async () => {
    if (!restaurant) return;
    setLoading(true);
    try {
      await dispatch(updateRestaurant({ id: restaurant.id, ...billingData })).unwrap();
      toast.success('Billing details updated');
    } catch {
      toast.error('Failed to update billing details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    if (!restaurant) return;
    setLoading(true);
    try {
      const { data } = await api.post('/subscriptions/init', { restaurantId: restaurant.id, plan });
      window.location.href = data.data.authorizationUrl;
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  if (!restaurant) return <div className="text-center py-20 text-muted-foreground font-medium">Select a restaurant first.</div>;

  return (
    <div ref={containerRef} className="max-w-5xl space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Account Settings</h1>
        <p className="text-muted-foreground mt-1 font-medium">Manage your profile, organization, billing, and security.</p>
      </div>

      <div className="flex gap-2 p-1 bg-muted/30 rounded-xl w-max">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="settings-reveal min-h-[500px]">
        {activeTab === 'profile' && (
          <Card className="border-border shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Full Name" value={profileName} onValueChange={setProfileName} />
              <Input label="Phone Number" value={profilePhone} onValueChange={setProfilePhone} />
              <Input label="Email Address" value={user?.email || ''} readOnly className="bg-muted/30 opacity-60" />
              <Button onClick={handleUpdateProfile} loading={loading} className="mt-4">Save Profile</Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'organization' && (
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Configure how your restaurant appears to customers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Restaurant Name" value={orgData.name} onValueChange={(v) => setOrgData({ ...orgData, name: v })} />
                <Input label="Currency (e.g., GHS, USD)" value={orgData.currency} onValueChange={(v) => setOrgData({ ...orgData, currency: v })} />
                <Input label="Contact Phone" value={orgData.phone} onValueChange={(v) => setOrgData({ ...orgData, phone: v })} />
                <Input label="Contact Email" value={orgData.email} onValueChange={(v) => setOrgData({ ...orgData, email: v })} />
              </div>
              <Input label="Description" value={orgData.description} onValueChange={(v) => setOrgData({ ...orgData, description: v })} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Address" value={orgData.address} onValueChange={(v) => setOrgData({ ...orgData, address: v })} />
                <Input label="City" value={orgData.city} onValueChange={(v) => setOrgData({ ...orgData, city: v })} />
              </div>
              <Button onClick={handleUpdateOrg} loading={loading}>Save Organization</Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-8">
            <Card className="border-border shadow-sm">
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle>Subscription Plan</CardTitle>
                  <CardDescription>Your current plan and upgrade options.</CardDescription>
                </div>
                <Badge variant={restaurant.subStatus === 'active' ? 'success' : 'warning'} className="capitalize">{restaurant.subStatus}</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-3">
                  {(['starter', 'pro', 'business'] as const).map((plan) => {
                    const isCurrent = restaurant.plan === plan;
                    const cfg = PLAN_FEATURES[plan];
                    const Icon = cfg.icon;
                    return (
                      <div key={plan} className={cn("relative flex flex-col p-5 rounded-2xl border transition-all", isCurrent ? "bg-primary/5 border-primary" : "bg-muted/20 border-border")}>
                        {isCurrent && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-primary rounded-full text-[9px] font-black text-primary-foreground shadow-sm">CURRENT</div>}
                        <div className="flex items-center justify-between mb-4">
                          <div className={cn("p-1.5 rounded-lg border", isCurrent ? "bg-background text-primary border-primary/20" : "bg-background border-border")}><Icon size={16} /></div>
                          <p className={cn("text-sm font-black capitalize", isCurrent ? "text-primary" : "text-foreground")}>{plan}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium mb-4 h-8">{cfg.desc}</p>
                        <ul className="space-y-2 mb-6 flex-1">
                          {cfg.features.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground"><Check size={10} className="text-primary" /><span>{f}</span></li>
                          ))}
                        </ul>
                        {!isCurrent && plan !== 'starter' && (
                          <Button variant="outline" className="w-full text-[10px] h-8" onClick={() => handleUpgrade(plan)} loading={loading}>Adopt {plan}</Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm max-w-3xl">
              <CardHeader>
                <CardTitle>Payment & Settlement</CardTitle>
                <CardDescription>Configure Paystack integrations and payout details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Paystack Public Key" value={billingData.paystackPublicKey} onValueChange={(v) => setBillingData({ ...billingData, paystackPublicKey: v })} />
                  <Input label="Paystack Secret Key" value={billingData.paystackSecretKey} onValueChange={(v) => setBillingData({ ...billingData, paystackSecretKey: v })} type="password" />
                  <Input label="Settlement Type (e.g., bank, momo)" value={billingData.settlementType} onValueChange={(v) => setBillingData({ ...billingData, settlementType: v })} />
                  <Input label="Settlement Bank / Provider" value={billingData.settlementBank} onValueChange={(v) => setBillingData({ ...billingData, settlementBank: v })} />
                  <Input label="Account Number" value={billingData.settlementAccountNumber} onValueChange={(v) => setBillingData({ ...billingData, settlementAccountNumber: v })} />
                </div>
                <Button onClick={handleUpdateBilling} loading={loading}>Save Payment Settings</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'security' && (
          <Card className="border-border shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Change your password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Current Password" type="password" value={passData.oldPassword} onValueChange={(v) => setPassData({ ...passData, oldPassword: v })} placeholder="Leave blank if you use Google Auth" />
              <Input label="New Password" type="password" value={passData.newPassword} onValueChange={(v) => setPassData({ ...passData, newPassword: v })} />
              <Button onClick={handleChangePassword} loading={loading} className="mt-4">Update Password</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
