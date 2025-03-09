import '../BrainFeatures.scss';
import BrainBase from '../utils/BrainBase';

export default function KnowledgeReview() {
  const topic = window.topic || {};

  return (
    <BrainBase header={`${topic.title} Review`}>
    </BrainBase>
  );
}
