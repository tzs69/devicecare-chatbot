import { Box, Typography, Paper } from '@mui/material';

export type ChatBubble1Props = {
  role: string;
  content: string;
  datetimestr: string;
}

function ChatBubble(props: ChatBubble1Props) {

  const isUser = props.role === 'user';
  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          maxWidth: '80%',
          p: 1.5,
          borderRadius: '16px',
          bgcolor: isUser ? '#007BFF' : '#f0f0f0',
          color: isUser ? 'white' : 'black',
          textAlign: 'left',
          wordBreak: 'break-word',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          ml: isUser ? 'auto' : 0,   // User: push to right
          mr: isUser ? 1 : 0,        // User: fixed 8px from right
          pl: isUser ? 1 : 1.5,      // Adjust padding for alignment
          pr: isUser ? 1.5 : 1,      // Adjust padding for alignment
        }}
      >

      {props.content}
      <Box>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: isUser ? 'right' : 'left',
            opacity: 0.7,
            fontSize: '0.75rem',
          }}
        >
          {isUser ? `You at ${props.datetimestr}` : `Device Care Bot at ${props.datetimestr}`}
        </Typography>
      </Box>
      </Paper>
    </Box>
  )
}

export default ChatBubble