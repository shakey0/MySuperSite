import '../BrainFeatures.scss';
import BrainBase from '../utils/BrainBase';
import './KnowledgeIndex.scoped.scss';

const topics = [
  { title: "Music", slug: "music" },
  { title: "Sport & Leisure", slug: "sport_and_leisure" },
  { title: "Film & TV", slug: "film_and_tv" },
  { title: "Arts & Literature", slug: "arts_and_literature" },
  { title: "History", slug: "history" },
  { title: "Society & Culture", slug: "society_and_culture" },
  { title: "Science", slug: "science" },
  { title: "Geography", slug: "geography" },
  { title: "Food & Drink", slug: "food_and_drink" },
  { title: "General Knowledge", slug: "general_knowledge" },
]

export default function KnowledgeIndex() {
  return (
    <BrainBase header="Brain - Knowledge">
      <div className="main-container">
        <div className="into-container bigger darker">
          <h2>Sharpen your knowledge</h2>
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

        <div className="topic-container">
          {topics.map((topic, index) => (
            <div key={index} className="topic-card">
              <h2>{topic.title}</h2>
              <p>
                <a href={`/brain/knowledge/${topic.slug}/quiz`}>Take quiz</a>
                <a href={`/brain/knowledge/${topic.slug}/review`}>Review</a>
              </p>
            </div>
          ))}
        </div>
      </div>
    </BrainBase>
  );
}
