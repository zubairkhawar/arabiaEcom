import { Shell } from "@/components/layout/Shell";
import { ChatPanel } from "@/components/chat/ChatPanel";

export default function ChatsPage() {
  return (
    <Shell
      portal="reseller"
      title="Live Chats"
      subtitle="AI handles every chat by default — take over with one click."
    >
      <ChatPanel />
    </Shell>
  );
}
