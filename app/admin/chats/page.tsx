import { Shell } from "@/components/layout/Shell";
import { ChatPanel } from "@/components/chat/ChatPanel";

export default function AllChatsPage() {
  return (
    <Shell
      portal="admin"
      title="All Chats"
      subtitle="Every conversation across every reseller. You can take over any chat."
    >
      <ChatPanel showReseller />
    </Shell>
  );
}
