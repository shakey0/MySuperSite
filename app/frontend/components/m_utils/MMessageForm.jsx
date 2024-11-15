import { useState } from 'react';
import './MMessageForm.scoped.scss';

function MMessageForm({ secret }) {
  const [message, setMessage] = useState('');

  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/m', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          authenticity_token: csrfToken,
          secret: secret,
          message: message,
        }),
      });
      const data = await response.json();

      if (data.outcome === 'success') {
        setMessage('');
      } else {
        console.error('Error submitting form:', data.outcome);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      <input type="hidden" name="secret" value={secret} />
      <textarea
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows="8"
      />
      <button type="submit" className="submit-message">Send message</button>
    </form>
  );
}

export default MMessageForm;
