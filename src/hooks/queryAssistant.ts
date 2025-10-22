import { useState, useCallback } from 'react';


function QueryAssistant(endpoint = 'http://localhost:4000/api/chat') {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(
  async (query: string): Promise<string> => {
    setPending(true);
    setError(null);
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }

    try {
      const resp = await fetch(endpoint, options);
      
      // Catch HTTP-level errors
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      }

      const data = await resp.json();

      // Enforce that 'reply' exists and is a string
      if (typeof data?.reply !== 'string') {
        throw new Error('Invalid response: expected { reply: string }');
      }

      return data.reply;
      
    // Catch all other errors 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const msg = e?.message || 'Failed to get response';
      setError(msg);
      return '';
    } finally {
      setPending(false);
    }
  }, 
[endpoint])
return { ask, pending, error };
};

export default QueryAssistant