import './BrainFeatures.scss';
import BrainBase from './utils/BrainBase';
import './BrainAuth.scoped.scss';

const fakeFormFields = [
  // { label: 'Primary school name', name: 'primary-school', type: 'text' },
  // { label: 'Seconary school name', name: 'secondary-school', type: 'text' },
  // { label: 'Favourite book', name: 'favourite-book', type: 'text' },
  { label: 'Favourite book OR movie', name: 'favourite-movie', type: 'text' },
  // { label: 'Favourite movie', name: 'favourite-movie', type: 'text' },
  { label: 'Favourite book OR movie character', name: 'favourite-character', type: 'text' },
  // { label: 'First car model', name: 'first-car', type: 'text' },
  // { label: 'First holiday destination', name: 'first-holiday', type: 'text' },
  // { label: 'Favourite holiday destination', name: 'favourite-holiday', type: 'text' },
  // { label: 'City you met your partner in', name: 'partner-city', type: 'text' },
  // { label: 'City you got married in', name: 'marriage-city', type: 'text' },
  // { label: 'Dream job as a child', name: 'dream-job', type: 'text' },
  // { label: 'Favourite drink', name: 'favourite-drink', type: 'text' },
  // { label: 'Favourite actor/actress', name: 'favourite-actor', type: 'text' },
  // { label: 'Favourite musician', name: 'favourite-musician', type: 'text' },
  { label: 'Name of first pet', name: 'first-pet', type: 'text' },
]

export default function Brain() {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  const handleSubmit = async (event) => {};

  const toggleTabs = (event) => {
    const tabs = document.querySelectorAll('.tabs-container button');
    tabs.forEach((tab) => tab.classList.remove('active'));
    event.target.classList.add('active');

    const forms = document.querySelectorAll('.auth-form');
    forms.forEach((form) => form.classList.remove('active'));
    forms[event.target.dataset.index].classList.add('active');
  }

  return (
    <BrainBase header="Sign in to use Brain">
      <div className="main-container">
        <div className="tabs-container">
          <button className="active" data-index="0" onClick={toggleTabs}>Log in</button>
          <button data-index="1" onClick={toggleTabs}>Sign up</button>
        </div>

        <form className="auth-form active" onSubmit={handleSubmit}>
          <input type="hidden" name="authenticity_token" value={csrfToken} />
            {fakeFormFields.map((field) => (
              <div className="input-container" key={field.name}>
                <label htmlFor={field.name}>{field.label}</label>
                <input type={field.type} name={field.name} />
              </div>
            ))}
          <button className="submit-button" type="submit">Log in</button>
        </form>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input type="hidden" name="authenticity_token" value={csrfToken} />
          <div className="input-container">
            <label htmlFor="name">Name/Nickname</label>
            <input type="text" name="name" />
          </div>
          {/* ADD TEXT DESCRIBING THE SIGN UP AND LOG IN PROCESS AND WHY THE USER IS ENTERING THIS INFORMATION */}
          {fakeFormFields.map((field) => (
            <div className="input-container" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <input type={field.type} name={field.name} />
            </div>
          ))}
          <button className="submit-button" type="submit">Sign up</button>
        </form>
      </div>
    </BrainBase>
  );
}
