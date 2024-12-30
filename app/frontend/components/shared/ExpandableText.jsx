import { useState } from 'react';

// This final returned p tag of this component should have a display of flex and a flex direction of column

const ExpandableText = ({ value, className, buttonClassName, limit, truncateBelow }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const truncateText = (text, limit) => {
    if (text.length <= limit) return text;
    
    // Find the last word boundary before the limit
    const truncated = text.substr(0, limit);
    const lastSpace = truncated.lastIndexOf(' ');
    return text.substr(0, lastSpace);
  };

  const renderContent = () => {
    const lines = value.split('\n');
    const fullText = lines.join('\n');
    
    if (fullText.length <= limit) {
      return lines.map((line, idx) => (
        <span key={idx}>
          {line}
          <br />
        </span>
      ));
    }

    const displayText = isExpanded ? fullText : truncateText(fullText, truncateBelow);
    const displayLines = displayText.split('\n');

    return displayLines.map((line, idx) => (
      <span key={idx}>
        {line}
        {idx === displayLines.length - 1 ? (
          <>
            {!isExpanded && <span> . . .</span>}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`${isExpanded ? 'active' : ''} ${buttonClassName}`}
            >
              {isExpanded ? 'Read less' : 'Read more'}
            </button>
          </>
        ) : (
          <br />
        )}
      </span>
    ));
  };

  return (
    <p className={className}>
      {renderContent()}
    </p>
  );
};

export default ExpandableText;
