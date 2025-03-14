
import { useState } from "react";

export const useMessageState = () => {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  return {
    newMessage, 
    setNewMessage,
    sending,
    setSending
  };
};
