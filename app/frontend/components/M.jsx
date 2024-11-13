import { useEffect, useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [showCurrentForm, setShowCurrentForm] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
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
            if (convoStartTime > Date.now() - 3600000 || data.data.convos[i].seen === false) {
              currentConvo = data.data.convos[i].messages;
              break;
            }
          }
          if (currentConvo !== null) {
            setMessages(currentConvo);
            setShowCurrentForm(true);
            setShowNewForm(false);
          } else {
            setMessages([{ direction: 'none', message: 'No messages in the last hour' }]);
            setShowCurrentForm(false);
            setShowNewForm(true);
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
    <div>
      <h1>Messages for secret: {secret}</h1>
      <ul>
        {messages.map(({ message, direction }, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      {showCurrentForm && (
        <form action="/m" method="post">
          <input type="hidden" name="secret" value={secret} />
          <input type="text" name="message" />
          <button type="submit">Send</button>
        </form>
      )}
      {showNewForm && (
        <form action="/m/new" method="post">
          <input type="hidden" name="secret" value={secret} />
          <input type="text" name="message" />
          <button type="submit">Send message</button>
        </form>
      )}
    </div>
  )
}
