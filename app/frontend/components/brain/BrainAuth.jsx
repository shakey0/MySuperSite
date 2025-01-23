import { useState, useEffect } from 'react';
import './BrainFeatures.scss';
import BrainBase from './utils/BrainBase';
import './BrainAuth.scoped.scss';

const getFormFields = [
  { label: 'Name/Nickname', name: 'name', type: 'text' },
  { label: 'Email', name: 'email', type: 'text' },
  { label: 'Password', name: 'password', type: 'password' },
  { label: 'Confirm password', name: 'confirm_password', type: 'password' },
]

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin(email, password) {
  if (!emailRegex.test(email) || password.length < 8) {
    return ['Invalid email or password.'];
  }
  return [];
}

function validateSignUp(name, email) {
  const errors = [];
  if (name.length === 0) {
    errors.push('Name/Nickname is required.');
  } else if (name.length < 2) {
    errors.push('Name/Nickname must be at least 2 characters.');
  } else if (name.length > 20) {
    errors.push('Name/Nickname cannot be more than 20 characters.');
  }
  if (email.length === 0) {
    errors.push('Email is required.');
  } else if (!emailRegex.test(email)) {
    errors.push('Invalid email address.');
  }
  return errors;
}

function validateSetPassword(password, confirmPassword) {
  const errors = [];
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters.');
  }
  if (password !== confirmPassword) {
    errors.push('Passwords do not match.');
  }
  return errors;
}

// ADD SET_PASSWORD STUFF TO THIS NEXT !!!!!!!!!

export default function Brain() {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMessages, setAuthMessages] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setAuthMessages([]);

    const formData = new FormData(event.target);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    const formFields = Object.keys(data);

    // Check there are no empty fields
    const emptyFields = formFields.filter((field) => data[field].length === 0);
    if (emptyFields.length > 0) {
      setIsSubmitting(false);
      return;
    }

    const process = data.confirm_password ? "set_password" : data.name ? "sign_up" : "log_in";

    const errors = process === "log_in" ? validateLogin(data.email, data.password) :
      process === "sign_up" ? validateSignUp(data.name, data.email) :
      validateSetPassword(data.password, data.confirm_password);

    if (errors.length > 0) {
      setAuthMessages(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/${process}`, {
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
        if (process === "log_in") 
          window.location.href = '/brain';
        else if (process === "sign_up")
          setAuthMessages(["An invitation email has been sent to your email address. It will be valid for 10 minutes."]);
        else if (process === "set_password")
          window.location.href = '/brain/auth?message=password_set';
      } else {
        setAuthMessages(responseData.errors);
      }
    }
    catch (error) {
      console.error('Error during auth process:', error);
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

    setAuthMessages([]);
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
          {getFormFields.slice(1, 3).map((field) => (
            <div className="input-container" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <input type={field.type} name={field.name} />
            </div>
          ))}
          <button className="submit-button" type="submit" disabled={isSubmitting}>Log in</button>
        </form>

        <form className="auth-form sign-up" onSubmit={handleSubmit}>
          <div className="into-container">
            <p>This sign up will be valid for all services across shakey0.co.uk that require an account.</p>
            <p>shakey0.co.uk will use cookies to quickly identify your account and make your experience as smooth as possible.</p>
            <p>By signing up, you agree to the <b>Terms of Service</b> and <b>Privacy Policy</b>.</p>
          </div>
          {/* https://chatgpt.com/c/6787a022-dd64-8004-b203-b8a1014ff4d2 - HANDLING USER SESSIONS WITH DYNAMODB */}
          {/* https://chatgpt.com/c/6787d5a5-d024-8004-a997-37327f05f4cc - HANDLING ITEMS - KNOWLEDGE/LOGIC/MATH - DATA WITH DYNAMODB */}
          {getFormFields.slice(0, 2).map((field) => (
            <div className="input-container" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <input type={field.type} name={field.name} id={field.name} />
            </div>
          ))}
          <button className="submit-button" type="submit" disabled={isSubmitting}>Sign up</button>
        </form>

        {authMessages.length > 0 && (
          <div className="after-container">
            {authMessages.map((message, index) => (
              <p key={index}>{message}</p>
            ))}
          </div>
        )}
      </div>
    </BrainBase>
  );
}
