"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SOCIAL_NETWORKS } from "@/lib/constants";
import type { SocialNetwork, WatermarkConfig } from "@/lib/types";
import { SocialIcon } from "@/remotion/Watermark";
import { cn } from "@/lib/utils";

export function WatermarkPicker({
  value,
  onChange,
}: {
  value: WatermarkConfig;
  onChange: (v: WatermarkConfig) => void;
}) {
  const toggleNetwork = (id: SocialNetwork) => {
    const networks = value.networks.includes(id)
      ? value.networks.filter((n) => n !== id)
      : [...value.networks, id];
    onChange({ ...value, networks });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="wm-enabled" className="text-base">
          Marca de agua
        </Label>
        <Switch
          id="wm-enabled"
          checked={value.enabled}
          onCheckedChange={(enabled) => onChange({ ...value, enabled })}
        />
      </div>

      {value.enabled && (
        <div className="space-y-4 rounded-lg border border-border/60 bg-secondary/40 p-4">
          <div className="space-y-2">
            <Label htmlFor="wm-handle">Tu usuario</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                @
              </span>
              <Input
                id="wm-handle"
                className="pl-8"
                placeholder="versosqueimpactan"
                value={value.handle}
                onChange={(e) =>
                  onChange({ ...value, handle: e.target.value.replace(/^@/, "") })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Redes sociales</Label>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_NETWORKS.map((n) => {
                const active = value.networks.includes(n.id as SocialNetwork);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => toggleNetwork(n.id as SocialNetwork)}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-all",
                      active
                        ? "border-gold/60 bg-gold/15 text-gold-light"
                        : "border-border text-muted-foreground hover:border-gold/30"
                    )}
                  >
                    <SocialIcon
                      network={n.id as SocialNetwork}
                      size={16}
                      color="currentColor"
                    />
                    {n.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
