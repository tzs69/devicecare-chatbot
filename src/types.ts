// Enforce role values for chat messages
export type Role = 'user' | 'assistant';

// Message entry structure for chat history (messages) array
export interface MessageEntry { 
  datetimestr: string;
  role: Role; 
  content: string;
};