export type Role = 'user' | 'assistant';

export interface MessageEntry { 
  datetimestr: string;
  role: Role; 
  content: string;
};