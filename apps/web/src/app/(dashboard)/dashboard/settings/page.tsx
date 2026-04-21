'use client';

import { useState, useEffect } from 'react';
import { 
  Crown, 
  CreditCard, 
  User as UserIcon, 
  Building2, 
  Check, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Gem
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/stores/store';
import { updateRestaurant } from '@/stores/restaurantSlice';
import api from '@/lib/api';
import { formatGHS } from '@tableo/utils';
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
  starter: { 
    desc: 'Perfect for single locations',
    icon: Zap,
    features: ['1 branch', 'Basic menu', 'QR ordering'] 
  },
  pro: { 
    desc: 'For growing restaurant groups', 
    icon: Crown,
    features: ['Up to 3 branches', 'Analytics', 'Staff management', 'Priority support'] 
  },
  business: { 
    desc: 'Unlimited scale & enterprise features', 
    icon: Gem,
    features: ['Unlimited branches', 'Advanced analytics', 'API access', 'Dedicated support'] 
  },
};

export default function SettingsPage() {
  const { current: restaurant } = useAppSelector((s) => s.restaurant);
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [restaurantName, setRestaurantName] = useState(restaurant?.name ?? '');
  const containerRef = React.useRef(null);

  useEffect(() => {
    if (restaurant) setRestaurantName(restaurant.name);
  }, [restaurant?.id]);

  useGSAP(() => {
    gsap.from('.settings-reveal', {
      opacity: 0,
      y: 10,
      stagger: 0.05,
      duration: 0.4,
      ease: 'power3.out'
    });
  }, { scope: containerRef });

  const handleUpdateName = async () => {
    if (!restaurant || !restaurantName.trim()) return;
    try {
      await dispatch(updateRestaurant({ id: restaurant.id, name: restaurantName })).unwrap();
      toast.success('Settings synced');
    } catch {
      toast.error('Sync failed');
    }
  };

  const handleUpgrade = async (plan: string) => {
    if (!restaurant) return;
    setLoading(true);
    try {
      const { data } = await api.post('/subscriptions/init', {
        restaurantId: restaurant.id,
        plan,
      });
      window.location.href = data.data.authorizationUrl;
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  if (!restaurant) return <div className="text-center py-20 text-muted-foreground font-medium">Select a restaurant first.</div>;

  return (
    <div ref={containerRef} className="max-w-5xl space-y-10 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Account Settings</h1>
        <p className="text-muted-foreground mt-1 font-medium">Control your restaurant operations and subscription.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Identity */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="settings-reveal border-border shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <UserIcon size={18} />
              </div>
              <CardTitle className="text-sm font-bold">Personal Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Identity" value={user?.fullName ?? ''} readOnly className="bg-muted/30" />
              <Input label="Verified Email" value={user?.email ?? ''} readOnly className="bg-muted/30" />
            </CardContent>
          </Card>

          <Card className="settings-reveal border-border shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Building2 size={18} />
              </div>
              <CardTitle className="text-sm font-bold">Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Restaurant Legal Name"
                value={restaurantName}
                onValueChange={setRestaurantName}
                placeholder="The Main Branch"
              />
              <Button
                className="w-full text-xs font-bold h-9"
                onClick={handleUpdateName}
                disabled={restaurantName === restaurant.name}
              >
                Sync Organization Name
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Billing */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="settings-reveal border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <CreditCard size={18} />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Subscription Plan</CardTitle>
                  <CardDescription className="text-[9px] uppercase font-black tracking-widest mt-0.5 opacity-60">
                    Billing cycle and tiers
                  </CardDescription>
                </div>
              </div>
              <Badge variant={restaurant.subStatus === 'active' ? 'success' : 'warning'} className="capitalize">
                {restaurant.subStatus}
              </Badge>
            </CardHeader>
            
            <CardContent className="space-y-10 pt-2">
              <div className="grid gap-6 sm:grid-cols-3">
                {(['starter', 'pro', 'business'] as const).map((plan) => {
                  const isCurrent = restaurant.plan === plan;
                  const cfg = PLAN_FEATURES[plan];
                  const Icon = cfg.icon;
                  return (
                    <div 
                      key={plan}
                      className={cn(
                        "relative flex flex-col p-5 rounded-2xl border transition-all duration-300",
                        isCurrent 
                          ? "bg-primary/5 border-primary shadow-sm" 
                          : "bg-muted/20 border-border hover:border-muted-foreground/30"
                      )}
                    >
                      {isCurrent && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-primary rounded-full text-[9px] font-black text-primary-foreground shadow-sm">
                          CURRENT
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-1.5 rounded-lg bg-background border border-border shadow-sm", isCurrent && "text-primary border-primary/20")}>
                          <Icon size={16} />
                        </div>
                        <p className={cn("text-sm font-black capitalize", isCurrent ? "text-primary" : "text-foreground")}>{plan}</p>
                      </div>

                      <p className="text-[10px] text-muted-foreground font-medium leading-relaxed mb-6 h-10">{cfg.desc}</p>

                      <ul className="space-y-2 mb-8 flex-1">
                        {cfg.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-[10px] font-bold text-muted-foreground">
                            <Check size={10} className="text-primary mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      {!isCurrent && plan !== 'starter' && (
                        <Button
                          variant="outline"
                          className="w-full text-[10px] h-8 font-black uppercase tracking-tight border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground group"
                          onClick={() => handleUpgrade(plan)}
                          loading={loading}
                        >
                          Adopt {plan} <ChevronRight size={12} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-foreground">Verified Merchant</h4>
                    <p className="text-[10px] font-medium text-muted-foreground">Payments handled securely by Paystack.</p>
                  </div>
                </div>
                <Badge variant="muted" className="h-6 px-3 text-[8px] font-black opacity-60">ENCRYPTED</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
