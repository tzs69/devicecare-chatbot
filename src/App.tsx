import { useState } from 'react';
import MessageInput from './components/MessageInput';
import { Box } from '@mui/material'
import QueryAssistant from "./hooks/queryAssistant";
import type { MessageEntry } from './types';
import ChatWindow from './components/ChatWindow'
import formatDate from './utils/formatDate';


function App() {

  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const { ask, pending, error} = QueryAssistant('http://localhost:4000/api/chat')

  const handleSend = async (text: string) => {

    if (!text.trim()) return
    
    const userMessage: MessageEntry = { datetimestr: formatDate(new Date()), role: 'user', content: text }
    setMessages((m => [...m, userMessage]));

    const reply = await ask(text);

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