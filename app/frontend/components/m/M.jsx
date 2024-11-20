import { useEffect, useState, useRef } from 'react';
import MMessageForm from './utils/MMessageForm';
import './M.base.scoped.scss';
import './M.scoped.scss';

export default function M({ admin }) {
  const [messages, setMessages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [secret, setSecret] = useState('');
  const messagesEndRef = useRef(null);
  const latestMessagesRef = useRef(messages);

  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const secretFromURL = pathParts[pathParts.length - 1];
    setSecret(secretFromURL);

    const fetchData = async () => {
      try {
        const response = await fetch(`/m_data?secret=${secretFromURL}`);
        const data = await response.json();
        if (data.outcome === 'success') {
          const currentConvo = data.convo;
          const receivedMessages = currentConvo?.messages?.length
            ? currentConvo.messages
            : [{ direction: 'none', message: 'No messages in the last hour' }];
          if (JSON.stringify(receivedMessages) !== JSON.stringify(latestMessagesRef.current)) {
            setMessages(receivedMessages);
          }
          setShowForm(true);
        } else {
          setMessages([{ direction: 'invalid', message: "That's not a secret code." }]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessages([{ direction: 'error', message: "Sorry, but something didn't go right there. I'll be looking into this. Please try again though." }]);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  return (
    <div className="main-container">
      {messages[0]?.direction !== 'invalid' && (
        <h1>Secret chat: {secret}</h1>
      )}
      <div className="messages-container">
        {messages.map(({ message, direction }, index) => (
          <p key={index} className={`message-${direction}`}>{message}</p>
        ))}
      </div>
      {showForm && (
        <MMessageForm secret={secret} admin={admin} />
      )}
      <div ref={messagesEndRef}></div>
    </div>
  )
}
