import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogOut, Monitor, Moon, Server, Settings as SettingsIcon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useThemeStore } from '@/stores/themeStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/firebase/auth';
import { STREAMING_PROVIDERS } from '@/services/streaming/providers';
import { ROUTES } from '@/lib/constants';

export default function SettingsPage() {
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const settings = useSettingsStore();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  async function handleLogout() {
    await authService.logout();
    toast.success('Signed out.');
    navigate(ROUTES.HOME);
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <SettingsIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Personalize your Strelix Stream experience.
          </p>
        </div>
      </div>

      {/* Appearance */}
      <section className="rounded-lg border border-border bg-card/40 p-6">
        <h2 className="font-display text-lg font-semibold">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Choose how Strelix Stream looks for you.
        </p>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>
              <div>
                <Label className="text-sm font-medium">Theme</Label>
                <p className="text-xs text-muted-foreground">
                  Currently using {theme === 'system' ? 'system preference' : `${theme} mode`}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={theme} onValueChange={(v) => setTheme(v as 'dark' | 'light' | 'system')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
                <Monitor className="h-4 w-4" />
              </div>
              <div>
                <Label className="text-sm font-medium">Reduce animations</Label>
                <p className="text-xs text-muted-foreground">
                  Disable transitions and motion effects.
                </p>
              </div>
            </div>
            <Switch
              checked={settings.reduceAnimations}
              onCheckedChange={settings.setReduceAnimations}
            />
          </div>
        </div>
      </section>

      {/* Playback */}
      <section className="mt-6 rounded-lg border border-border bg-card/40 p-6">
        <h2 className="font-display text-lg font-semibold">Playback</h2>
        <p className="text-sm text-muted-foreground">
          Configure how streams play.
        </p>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
                <Server className="h-4 w-4" />
              </div>
              <div>
                <Label className="text-sm font-medium">Default server</Label>
                <p className="text-xs text-muted-foreground">
                  Choose the streaming provider used by default on watch pages.
                </p>
              </div>
            </div>
            <Select
              value={settings.preferredServer}
              onValueChange={settings.setPreferredServer}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STREAMING_PROVIDERS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm font-medium">Autoplay</Label>
              <p className="text-xs text-muted-foreground">
                Automatically play the next episode when one ends.
              </p>
            </div>
            <Switch checked={settings.autoplay} onCheckedChange={settings.setAutoplay} />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm font-medium">Subtitles</Label>
              <p className="text-xs text-muted-foreground">
                Show subtitles when available.
              </p>
            </div>
            <Switch
              checked={settings.subtitlesEnabled}
              onCheckedChange={settings.setSubtitlesEnabled}
            />
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="mt-6 rounded-lg border border-border bg-card/40 p-6">
        <h2 className="font-display text-lg font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">
          {firebaseUser?.email ?? 'Not signed in'}
        </p>

        <div className="mt-4">
          <Button variant="destructive" className="gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </section>
    </div>
  );
}
