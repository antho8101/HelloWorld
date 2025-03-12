
import { useState } from "react";
import type { Message } from "@/types/messages";

export const useMessageState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesFetched, setMessagesFetched] = useState(false);
  const [messageError, setMessageError] = useState(false);
  const [sending, setSending] = useState(false);

  return {
    messages,
    setMessages,
    newMessage, 
    setNewMessage,
    loadingMessages,
    setLoadingMessages,
    messagesFetched,
    setMessagesFetched,
    messageError,
    setMessageError,
    sending,
    setSending
  };
};
