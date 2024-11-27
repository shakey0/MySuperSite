import { useEffect, useState, useRef } from 'react';
import './MMessageForm.scoped.scss';

function MMessageForm({ secret, admin }) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const route = admin ? '/m_admin' : '/m';

  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  // Resend unsent message if it exists
  useEffect(() => {
    const unsentMessage = sessionStorage.getItem('unsentMessage');
    if (unsentMessage) {
      sessionStorage.removeItem('unsentMessage');

      const resendMessage = async () => {
        try {
          const response = await fetch(route, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': csrfToken,
            },
            body: JSON.stringify({
              authenticity_token: csrfToken,
              secret: secret,
              message: unsentMessage,
            }),
          });

          if (!response.ok) {
            console.error('Error resending message:', response.statusText);
          }
        } catch (error) {
          console.error('Error resending message:', error);
        }
      };

      resendMessage();
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(route, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          authenticity_token: csrfToken,
          secret: secret,
          message: message.trim(),
        }),
      });

      if (response.status === 422) {
        // Store the message temporarily and reload the page
        sessionStorage.setItem('unsentMessage', message.trim());
        window.location.reload();
        return;
      }

      const data = await response.json();
      if (data.outcome === 'success') {
        setMessage('');
        textareaRef.current.focus();
      } else {
        console.error('Error submitting form:', data.outcome);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 200);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!event.shiftKey && !event.ctrlKey) {
        handleSubmit(event);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      <input type="hidden" name="secret" value={secret} />
      <textarea
        ref={textareaRef}
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows="6"
      />
      <button 
        type="submit" 
        className={`submit-message ${isSubmitting ? 'active' : ''}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : 'Send message'}
      </button>
    </form>
  );
}

export default MMessageForm;
