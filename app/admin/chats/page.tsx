import { Shell } from "@/components/layout/Shell";
import { LiveChatPanel } from "@/components/chat/LiveChatPanel";

export default function AllChatsPage() {
  return (
    <Shell
      portal="admin"
      title="All Chats"
      subtitle="Every conversation across every reseller. You can take over any chat."
      showFilters
    >
      <LiveChatPanel scope="admin" />
    </Shell>
  );
}
