import { useState } from 'react';
import MessageInput from './components/MessageInput';
import { Box } from '@mui/material'
import useAssistant from "./hooks/useAssistant";
import type { MessageEntry } from './types';
import ChatWindow from './components/ChatWindow'
import formatDate from './utils/formatDate';

/**
 * Main application component that orchestrates the chat interface.
 * 
 * Responsibilities:
 * - Manages the message history state (user and assistant messages)
 * - Integrates with the `useAssistant` hook to communicate with the backend chat API
 * - Renders the chat window and message input, passing down/up relevant props
 * - Formats message timestamps using `formatDate`
 * 
 * Data Flow:
 * 1. User types and submits a message via `MessageInput`
 * 2. `handleSend` appends the user message and invokes `useAssistant.ask()`
 * 3. Assistant response (or error) is appended to the message list
 * 
 * Backend: Communicates with http://localhost:4000/api/chat
 */
function App() {

  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const { ask, pending, error} = useAssistant('http://localhost:4000/api/chat')

  // Handles submission of a new user message
  const handleSend = async (text: string) => {

    if (!text.trim()) return
    
    // Create user message entry and append it to messages
    const userMessage: MessageEntry = { datetimestr: formatDate(new Date()), role: 'user', content: text }
    setMessages((m => [...m, userMessage]));

    const reply = await ask(text);

    // Create assistant message entry and append it to messages
    const assistantMessage: MessageEntry = { datetimestr: formatDate(new Date()), role: 'assistant', content: error ? error : reply }
    setMessages((m => [...m, assistantMessage]));
  
  };
  
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh', // Full viewport height
      width: '100%',
      backgroundImage: `url('/background_wallpaper.jpg')`
    }}>
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column-reverse',
        overflowY: 'auto', // Enables scrolling for chat content
        padding: 2,
      }}>
        <ChatWindow messages={messages} />
      </Box>
      <Box sx={{
        padding: 2,
        backgroundColor: 'background.paper', // Optional: adds background
        borderTop: '1px solid', // Optional: adds border
        borderColor: 'divider',
      }}>
        <MessageInput 
          onSend={handleSend} 
          pending={pending}/>
      </Box>
    </Box>
  )
}

export default App;