"use client";

import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function PlatformSettingsPage() {
  return (
    <Shell
      portal="admin"
      title="Platform Settings"
      subtitle="Global defaults applied across all resellers unless overridden."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Default AI persona" subtitle="What new resellers inherit" />
          <div className="space-y-4">
            <Input label="Default AI name" defaultValue="Max" />
            <Select
              label="Default tone"
              defaultValue="Friendly"
              options={[
                { value: "Friendly", label: "Friendly" },
                { value: "Professional", label: "Professional" },
                { value: "Playful", label: "Playful" },
              ]}
            />
            <Select
              label="Default response length"
              defaultValue="Medium"
              options={[
                { value: "Short", label: "Short" },
                { value: "Medium", label: "Medium" },
                { value: "Long", label: "Long" },
              ]}
            />
            <Textarea
              label="Default opening message"
              defaultValue="Hi! Welcome to {{brand}} 👋 How can I help?"
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Branding" subtitle="Shown to resellers in the dashboard" />
          <div className="space-y-4">
            <Input label="Platform name" defaultValue="Arabia AI" />
            <Input label="Support contact" defaultValue="support@arabia-ai.com" />
            <Input label="Support phone" defaultValue="+971 4 555 0100" />
            <div className="rounded-xl border border-[var(--border)] p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600" />
              <div className="text-sm">
                <div className="font-medium">Logo</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  PNG or SVG · transparent background
                </div>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Replace
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Video guide URLs" subtitle="Shown in the channel setup wizards" />
          <div className="space-y-4">
            <Input
              label="WhatsApp own-number guide"
              defaultValue="https://videos.arabia-ai.com/wa-meta-setup.mp4"
            />
            <Input
              label="Shopify webhook guide"
              defaultValue="https://videos.arabia-ai.com/shopify-webhook.mp4"
            />
            <Input
              label="AI training guide"
              defaultValue="https://videos.arabia-ai.com/training.mp4"
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Limits & defaults" subtitle="Plan caps & global thresholds" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Starter — monthly chats" defaultValue="500" />
            <Input label="Growth — monthly chats" defaultValue="5,000" />
            <Input label="Scale — monthly chats" defaultValue="Unlimited" />
            <Input label="Pool capacity per number" defaultValue="50" />
            <Input label="Auto-escalate after (msgs)" defaultValue="3" />
            <Input label="AI typing delay (ms)" defaultValue="900" />
          </div>
        </Card>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save platform settings</Button>
      </div>
    </Shell>
  );
}
