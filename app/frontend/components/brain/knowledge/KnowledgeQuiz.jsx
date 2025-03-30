import '../BrainFeatures.scss';
import BrainBase from '../utils/BrainBase';
import SubmitButton from '../utils/SubmitButton';
import './KnowledgeQuiz.scoped.scss';

export default function KnowledgeQuiz() {
  const topic = window.topic || {};
  const [level, setLevel] = React.useState(null);
  const [error, setError] = React.useState("");

  const startQuiz = () => {
    // Check if level is selected
    if (level === null) {
      setError("Please select a level.");
      return;
    }

    // Logic to send request to start quiz
  };

  return (
    <BrainBase header={`${topic.title} Quiz`}>
      <div className="main-container">
        <h2 className="mobile-quiz-title">{topic.title} Quiz</h2>
        <div className="topic-container">
          <div className="topic-card">
            <h2>Select your level:</h2>
            <p className="v-mobile-column">
              <button
                className={`button ${level === "easy" ? "active" : level !== null ? "inactive" : ""}`}
                onClick={() => setLevel("easy")}
              >
                Easy
              </button>
              <button
                className={`button ${level === "medium" ? "active" : level !== null ? "inactive" : ""}`}
                onClick={() => setLevel("medium")}
              >
                Medium
              </button>
              <button
                className={`button ${level === "hard" ? "active" : level !== null ? "inactive" : ""}`}
                onClick={() => setLevel("hard")}
              >
                Hard
              </button>
            </p>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <SubmitButton text="Start Quiz" disabled={false} manualHandling onClick={startQuiz} />
      </div>
    </BrainBase>
  );
}
