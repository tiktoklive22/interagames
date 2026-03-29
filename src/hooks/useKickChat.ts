import { useState, useEffect, useCallback, useRef } from 'react';

interface KickBadge {
  type: string;
  text: string;
  active: boolean;
}

interface KickMessage {
  username: string;
  message: string;
  timestamp: number;
  avatar?: string;
  color?: string;
  badges?: KickBadge[];
}

export function useKickChat(channelName: string, onMessage: (username: string, message: string, identity?: { avatar?: string, color?: string, badges?: KickBadge[] }) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<KickMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  // Update ref whenever onMessage changes
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(async () => {
    if (!channelName) return;
    
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const kickWSUri = "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=7.6.0&flash=false";
      const ws = new WebSocket(kickWSUri);
      wsRef.current = ws;

      ws.addEventListener("open", async () => {
        try {
          const res = await fetch(`https://kick.com/api/v2/channels/${channelName}`);
          const data = await res.json();
          const chatroomId = data.chatroom.id;

          ws.send(JSON.stringify({
            event: "pusher:subscribe",
            data: {
              auth: "",
              channel: `chatrooms.${chatroomId}.v2`,
            },
          }));

          setIsConnected(true);
          console.log("Connected to Kick chat:", channelName);
        } catch (err) {
          console.error("Failed to get channel info:", err);
        }
      });

      ws.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);

        if (data.event === "App\\Events\\ChatMessageEvent") {
          const msg = JSON.parse(data.data);
          const username = msg.sender.username;
          const content = msg.content;
          const avatar = msg.sender.identity?.profile_pic || msg.sender.profile_pic;
          const color = msg.sender.identity?.color;
          const badges = msg.sender.identity?.badges;

          setMessages(prev => [{ 
            username, 
            message: content, 
            timestamp: Date.now(), 
            avatar,
            color,
            badges
          }, ...prev].slice(0, 50));
          onMessageRef.current(username, content, { avatar, color, badges });
        }
      });

      ws.addEventListener("close", () => {
        setIsConnected(false);
        console.log("Disconnected from Kick chat");
      });

    } catch (err) {
      console.error("WebSocket connection error:", err);
    }
  }, [channelName]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  return { isConnected, messages, connect, disconnect };
}
