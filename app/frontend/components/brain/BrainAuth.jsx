import { useState, useEffect } from 'react';
import './BrainFeatures.scss';
import BrainBase from './utils/BrainBase';
import './BrainAuth.scoped.scss';

const fakeFormFields = [
  // { label: 'Name of your first pet', name: 'first-pet', type: 'text' },
  { label: 'Name of your primary school', name: 'primary-school', type: 'password' },
  { label: 'Name of your second grade teacher', name: 'second-grade-teacher', type: 'password' },
  // { label: 'The first film your saw at the cinema', name: 'first-film', type: 'text' },
  { label: 'The first company/person you worked for', name: 'first-company', type: 'password' },
  // { label: 'Name of your seconary school', name: 'secondary-school', type: 'text' },
  // { label: 'Your favourite book', name: 'favourite-book', type: 'text' },
  // { label: 'Your favourite movie', name: 'favourite-movie', type: 'text' },
  // { label: 'Your favourite movie character', name: 'favourite-character', type: 'text' },
  // { label: 'Your first car model', name: 'first-car', type: 'text' },
  // { label: 'Your first holiday destination', name: 'first-holiday', type: 'text' },
  // { label: 'Your favourite holiday destination', name: 'favourite-holiday', type: 'text' },
  // { label: 'City you met your partner in', name: 'partner-city', type: 'text' },
  // { label: 'City you got married in', name: 'marriage-city', type: 'text' },
  // { label: 'Your dream job as a child', name: 'dream-job', type: 'text' },
  // { label: 'Your favourite drink', name: 'favourite-drink', type: 'text' },
  // { label: 'Your favourite actor/actress', name: 'favourite-actor', type: 'text' },
  // { label: 'Your favourite musician', name: 'favourite-musician', type: 'text' },
]

export default function Brain() {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logInErrors, setLogInErrors] = useState([]);
  console.log(logInErrors);
  const [signUpErrors, setSignUpErrors] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.target);
    const data = {};

    formData.forEach((value, key) => {
      data[key] = value;
    });

    const process = data.name ? "sign_up" : "log_in";
    if (process === "log_in")
      setLogInErrors([]);
    else
      setSignUpErrors([]);

    // Check that all form fields are filled in with at least 3 characters
    const formFields = Object.keys(data);
    const invalidFields = formFields.filter((field) => data[field].length < 3);
    if (invalidFields.length > 0) {
      if (process === "log_in")
        setLogInErrors(invalidFields);
      else
        setSignUpErrors(invalidFields);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/brain/${process}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          ...data,
        }),
      });

      const responseData = await response.json();
      if (responseData.outcome === "success") {
        // Redirect to the user's dashboard
        window.location.href = '/brain';
      } else {
        if (process === "log_in")
          setLogInErrors(['invalid']);
        else
          setSignUpErrors(responseData.errors);
      }
    }
    catch (error) {
      console.error('Error during log in or sign up:', error);
    }
    finally {
      setIsSubmitting(false);
    }
  }

  const toggleTabs = (event) => {
    const tabs = document.querySelectorAll('.tabs-container button');
    tabs.forEach((tab) => tab.classList.remove('active'));
    event.target.classList.add('active');

    const forms = document.querySelectorAll('.auth-form');
    const targetIndex = event.target.dataset.index;
  
    // First, start the fade out
    forms.forEach((form) => {
      if (form.classList.contains('active')) {
        form.style.opacity = '0';
      }
    });
    
    // Wait for fade out to complete before switching forms
    setTimeout(() => {
      forms.forEach((form, index) => {
        if (index.toString() === targetIndex) {
          form.classList.add('active');
          // Trigger reflow to ensure transition happens
          form.offsetHeight;
          form.style.opacity = '1';
        } else {
          form.classList.remove('active');
        }
      });
    }, 300);

    setLogInErrors([]);
    setSignUpErrors([]);
  }

  useEffect(() => {
    const loginButton = document.querySelector('.tabs-container button[data-index="0"]');
    if (loginButton) {
      loginButton.click();
    }
  }, []);

  return (
    <BrainBase header="Sign in to use Brain">
      <div className="main-container">
        <div className="tabs-container">
          <button className="active" data-index="0" onClick={toggleTabs} disabled={isSubmitting}>Log in</button>
          <button data-index="1" onClick={toggleTabs} disabled={isSubmitting}>Sign up</button>
        </div>

        <form className="auth-form log-in active" onSubmit={handleSubmit}>
          {fakeFormFields.map((field) => (
            <div className="input-container" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <input type={field.type} name={field.name} />
            </div>
          ))}
          <button className="submit-button" type="submit" disabled={isSubmitting}>Log in</button>
          {logInErrors.length > 0 && (
            <div className="error-container">
              <p>Those details did not match!</p>
            </div>
          )}
        </form>

        <form className="auth-form sign-up" onSubmit={handleSubmit}>
          <div className="into-container">
            <p>This sign up will be valid for all services across shakey0.co.uk that require an account.</p>
            <p>I don't use any passwords or collect any personal information on my website.</p>
            <p>At shakey0.co.uk, your name/nickname is just for your own reference and can be changed in your account settings.</p>
            <p>Instead of a password, you will log in by answering the 3 pieces of memorable information about yourself.</p>
            <p>Once logged in, you will stay logged in on that browser for 1 year (unless you delete your cookies).</p>
            <p>shakey0.co.uk will use cookies to quickly identify your account and make your experience as smooth as possible.</p>
          </div>
          <div className="input-container">
            <label htmlFor="name">Name/Nickname</label>
            <input type="text" name="name" id="name" />
          </div>
          {/* https://chatgpt.com/c/6787a022-dd64-8004-b203-b8a1014ff4d2 - HANDLING USER SESSIONS WITH DYNAMODB */}
          {/* https://chatgpt.com/c/6787d5a5-d024-8004-a997-37327f05f4cc - HANDLING ITEMS - KNOWLEDGE/LOGIC/MATH - DATA WITH DYNAMODB */}
          {fakeFormFields.map((field) => (
            <div className="input-container" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <input type={field.type} name={field.name} id={field.name} />
            </div>
          ))}
          <button className="submit-button" type="submit" disabled={isSubmitting}>Sign up</button>
        </form>
      </div>
    </BrainBase>
  );
}
