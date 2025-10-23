import { useState, useCallback } from 'react';
import { TextField, Box } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';


export type MessageInputProps = {
  onSend: (text: string) => void;
  placeholder?: string;
  pending?: boolean; // disable input when waiting for system response / bot is responding
  autoFocus?: boolean;
};

// Renders a text input field and a send button for the user to type in and send their query.
function MessageInput({
  onSend,
  placeholder = 'Start typing…',
  pending = false,
  autoFocus = true,
}: MessageInputProps) {
  const [input, setInput] = useState<string>('');

  // Sends trimmed user input to parent via onSend callback if valid and not pending, then clears the field.
  const submit = useCallback(() => {
    const text = input.trim();
    if (!text || pending) return;
    onSend(text);
    setInput('');
  }, [input, pending, onSend]);

  // Handles user clicking on button to submit input
  const handleClick = () => {
    submit()
  };

  // Handles user pressing enter to submit input
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
        <IconButton aria-label="send">
          <SendIcon onClick={handleClick}/>
        </IconButton>
      </Box>
    </Box>
  )
};

export default MessageInput;