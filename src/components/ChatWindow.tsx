import { Box } from '@mui/material';
import type { MessageEntry } from '../types'
import ChatBubble from './ChatBubble'


export type ChatWindowProps = {
  messages: MessageEntry[]
}

/**
 * Renders a scrollable list of chat bubbles from the message history.
 * User messages align right; assistant messages align left.
 */
function ChatWindow(props: ChatWindowProps) {
  
  return (
    <Box > {props.messages.map((message, index) => (
      <Box key={index} sx = {{
        display: 'flex',
        justifyContent: message.role === 'user'
          ? 'flex-end' 
          : 'flex-start',
        marginBottom: 3,
      }}>
          <ChatBubble 
            role={message.role} 
            datetimestr={message.datetimestr} 
            content={message.content}
           />
      </Box>
    ))}
    </Box>
  );
}

export default ChatWindow;