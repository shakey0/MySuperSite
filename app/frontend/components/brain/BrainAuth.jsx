import './BrainFeatures.scss';
import BrainBase from './utils/BrainBase';
import './BrainAuth.scoped.scss';


export default function Brain() {
  return (
    <BrainBase header="Sign in to use Brain">
      <div className="main-container">
        <div className="tabs-container">
          <button className="active">Log in</button>
          <button>Sign up</button>
        </div>
      </div>
    </BrainBase>
  );
}
