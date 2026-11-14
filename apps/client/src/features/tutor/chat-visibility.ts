'use client';

import { createContext, useContext } from 'react';

// Whether the chat a message is in is the one on screen. Chats the student has left
// stay mounted, so a reply keeps streaming, but what runs on its own in them, like a
// mini-app, stops until the chat is shown again.
export const ChatVisibleContext = createContext(true);

export const useChatVisible = () => useContext(ChatVisibleContext);
