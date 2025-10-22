import { useState, useCallback } from 'react';
import { TextField, Box } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';


export type MessageInputProps = {
  onSend: (text: string) => void;
  placeholder?: string;
  pending?: boolean;      // disable while bot is responding
  autoFocus?: boolean;
  maxRows?: number;       // for multiline growth
};

function MessageInput({
  onSend,
  placeholder = 'Start typing…',
  pending = false,
  autoFocus = true,
  maxRows = 6,
}: MessageInputProps) {
  const [input, setInput] = useState<string>('');
  
  const submit = useCallback(() => {
    const text = input.trim();
    if (!text || pending) return;
    onSend(text);
    setInput(''); // clear after send
  }, [input, pending, onSend]);

  // Handle user clicking on button to submit input
  const handleClick = () => {
    submit()
  };

  // Handle user pressing enter to submit input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter -> send; Shift+Enter -> newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        alignItems: 'center', 
        gap: 0 
      }}
      >
      <TextField
        autoFocus = {autoFocus}
        fullWidth
        variant="standard"
        value={input}
        maxRows={maxRows}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={pending}
        slotProps={{
          input: {
            disableUnderline: true,
          },
        }}
      />
      <Box sx={{ alignContent:'center'}}>
        <IconButton aria-label="delete">
          <SendIcon onClick={handleClick}/>
        </IconButton>
      </Box>
    </Box>    
  )
};

export default MessageInput;