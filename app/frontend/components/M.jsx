import { useEffect, useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [secret, setSecret] = useState('');

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const secretFromURL = pathParts[pathParts.length - 1];
    setSecret(secretFromURL);

    const fetchData = async () => {
      try {
        const response = await fetch(`/m_data?secret=${secretFromURL}`);
        const data = await response.json();
        if (data.status === 'success') {
          let currentConvo = null;
          for (let i = 0; i < data.data.convos.length; i++) {
            // If the convo start_time is up to an hour ago
            const convoStartTime = Date.parse(data.data.convos[i].start_time.replace(" ", "T"));
            if (convoStartTime > Date.now() - 3600000) {
              currentConvo = data.data.convos[i].messages;
              break;
            }
          }
          if (currentConvo !== null) {
            setMessages(currentConvo);
          } else {
            setMessages([{ direction: 'none', message: 'No messages in the last hour' }]);
          }
        } else {
          setMessages([{ direction: 'invalid', message: "That's not a secret code." }]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessages([{ direction: 'error', message: "Sorry, but something didn't go right there. I'll be looking into this." }]);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <h1>Messages for secret: {secret}</h1>
      <ul>
        {messages.map(({ message, direction }, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  )
}
