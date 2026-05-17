import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { fetchConversations, fetchMessages, sendMessage } from "@/lib/app-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export function Chat() {
  return <ChatPage mode="tenant" />;
}

export function ChatPage({ mode }: { mode: "tenant" | "owner" }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Array<any>>([]);
  const [messages, setMessages] = useState<Array<any>>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const selectedConversationId = searchParams.get("conversationId");
  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedConversationId) ?? conversations[0],
    [conversations, selectedConversationId],
  );

  const channelType = mode === "tenant" ? "pencari kos" : "pemilik";

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchConversations(mode, user.id)
      .then((data) => setConversations(data))
      .catch((error) => toast.error(error.message || "Gagal memuat percakapan"))
      .finally(() => setLoading(false));
  }, [mode, user]);

  useEffect(() => {
    if (!selectedConversation || selectedConversationId) return;
    setSearchParams({ conversationId: selectedConversation.id });
  }, [selectedConversation, selectedConversationId, setSearchParams]);

  useEffect(() => {
    if (!selectedConversation) return;
    fetchMessages(selectedConversation.id)
      .then(setMessages)
      .catch((error) => toast.error(error.message || "Gagal memuat pesan"));
    const interval = setInterval(() => {
      fetchMessages(selectedConversation.id).then(setMessages).catch(() => undefined);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  const handleSend = async () => {
    if (!selectedConversation || !user) return;
    if (!messageText.trim()) return;
    setSending(true);
    try {
      await sendMessage(selectedConversation.id, user.id, messageText.trim());
      setMessageText("");
      const latest = await fetchMessages(selectedConversation.id);
      setMessages(latest);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-background px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chat {channelType}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Kelola percakapan dan kirim pesan langsung dari halaman ini.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
          <MessageCircle className="h-4 w-4" /> {conversations.length} percakapan
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
          <h2 className="text-sm font-semibold text-foreground">Percakapan</h2>
          <div className="mt-4 space-y-2">
            {conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada percakapan.</p>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setSearchParams({ conversationId: conversation.id })}
                  className={`w-full rounded-3xl p-4 text-left transition ${selectedConversation?.id === conversation.id ? "bg-primary/10" : "bg-background hover:bg-muted"}`}
                >
                  <p className="text-sm font-semibold text-foreground">{conversation.kos?.name ?? "Kos"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{conversation.kos?.area ?? "Area tidak diketahui"}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Terakhir: {new Date(conversation.last_message_at).toLocaleString("id-ID")}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          {selectedConversation ? (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Percakapan</p>
                  <h2 className="text-xl font-semibold text-foreground">{selectedConversation.kos?.name ?? "Kos"}</h2>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">{selectedConversation.kos?.area}</span>
              </div>
              <div className="mb-6 space-y-3 max-h-[60vh] overflow-y-auto px-1 pb-4">
                {messages.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-muted p-8 text-center text-sm text-muted-foreground">Belum ada pesan. Kirim pesan pertama sekarang.</div>
                ) : (
                  messages.map((message) => {
                    const isMine = message.sender_id === user?.id;
                    return (
                      <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm ${isMine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                          {message.content}
                          <div className="mt-2 text-xs text-muted-foreground">{new Date(message.created_at).toLocaleString("id-ID")}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="space-y-3">
                <Input value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Ketik pesan..." />
                <Button disabled={sending || !messageText.trim()} onClick={handleSend} className="w-full">
                  {sending ? "Mengirim..." : "Kirim Pesan"}
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-muted p-10 text-center text-muted-foreground">
              <p className="text-sm">Pilih percakapan untuk mulai berkomunikasi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
