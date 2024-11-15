import { useEffect, useState } from 'react';
import MMessageForm from './utils/MMessageForm';
import './M.scoped.scss';

export default function M({ admin }) {
  const [messages, setMessages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [secret, setSecret] = useState('');

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const secretFromURL = pathParts[pathParts.length - 1];
    setSecret(secretFromURL);

    const fetchData = async () => {
      try {
        const response = await fetch(`/m_data?secret=${secretFromURL}`);
        const data = await response.json();
        if (data.outcome === 'success') {
          let currentConvo = null;
          for (let i = 0; i < data.data.convos.length; i++) {
            // If the convo start_time is up to an hour ago
            const convoStartTime = Date.parse(data.data.convos[i].start_time.replace(" ", "T"));
            if (convoStartTime > Date.now() - 3600000 || data.data.convos[i].seen === false) {
              currentConvo = data.data.convos[i].messages;
              break;
            }
          }
          if (currentConvo !== null) {
            setMessages(currentConvo);
            setShowForm(true);
          } else {
            setMessages([{ direction: 'none', message: 'No messages in the last hour' }]);
            setShowForm(true);
          }
        } else {
          setMessages([{ direction: 'invalid', message: "That's not a secret code." }]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessages([{ direction: 'error', message: "Sorry, but something didn't go right there. I'll be looking into this. Please try again though." }]);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 2000);

    return () => clearInterval(intervalId);
  }, []);

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
    </div>
  )
}
