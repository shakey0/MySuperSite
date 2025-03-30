const InfoMessage = ({ message }) => {
  if (!message.links) {
    return <p>{message.text}</p>;
  }

  const parts = message.text.split(/{\w+}/);
  const keys = message.text.match(/{\w+}/g).map(key => key.slice(1, -1));
  
  return (
    <p>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < keys.length && (
            <a 
              href={message.links[keys[index]].href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {message.links[keys[index]].text}
            </a>
          )}
        </React.Fragment>
      ))}
    </p>
  );
};

export default InfoMessage;
