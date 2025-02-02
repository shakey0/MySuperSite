import '../BrainFeatures.scss';
import BrainBase from '../utils/BrainBase';
import './KnowledgeIndex.scoped.scss';

export default function KnowledgeIndex() {
  return (
    <BrainBase header="Sharpen your knowledge">
      <div className="main-container">
        <div className="into-container">
          <h2>Brain - Knowledge</h2>
          <p>
            Choose a topic and take a multiple choice quiz to test your knowledge.
          </p>
          <p>
            Review your answers after each quiz to reinforce your learning.
          </p>
          <p>
            Use the AI tool to learn more about various questions and answers.
          </p>
        </div>
      </div>
    </BrainBase>
  );
}
