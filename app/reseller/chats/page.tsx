import { Shell } from "@/components/layout/Shell";
import { LiveChatPanel } from "@/components/chat/LiveChatPanel";

export default function ChatsPage() {
  return (
    <Shell
      portal="reseller"
      title="Live Chats"
      subtitle="AI handles every chat by default — take over with one click."
      showFilters
    >
      <LiveChatPanel />
    </Shell>
  );
}
