import '../BrainFeatures.scss';
import BrainBase from '../utils/BrainBase';

export default function KnowledgeQuiz() {
  const topic = window.topic || {};

  return (
    <BrainBase header={`${topic.title} Quiz`}>
    </BrainBase>
  );
}
