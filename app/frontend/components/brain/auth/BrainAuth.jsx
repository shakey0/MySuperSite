import { useState, useEffect } from 'react';
import '../BrainFeatures.scss';
import BrainBase from '../utils/BrainBase';
import './BrainAuth.scoped.scss';
import validateForm from './validateForm';
import { getFormFields, getSignUpInfo, getSetPasswordInfo } from '../../shared/authConstants';
import InfoMessage from '../../shared/InfoMessage';
import AuthField from './AuthField';
import SubmitButton from '../utils/SubmitButton';

export default function BrainAuth() {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMessages, setAuthMessages] = useState([]);

  const queryParams = new URLSearchParams(window.location.search);
  const authToken = queryParams.get('auth_token');
  const message = queryParams.get('message');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setAuthMessages([]);

    const formData = new FormData(event.target);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    const emptyFields = Object.keys(data).filter((field) => data[field].length === 0);
    if (emptyFields.length > 0) {
      setIsSubmitting(false);
      return;
    }

    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

    const process = data.confirm_password ? "set_password" : 
                    data.name ? "sign_up" : 
                    data.password ? "log_in" : 
                    "forgot_password";

    const errors = validateForm(process, data);

    if (errors.length > 0) {
      setAuthMessages(errors);
      setIsSubmitting(false);
      setTimeout(() => {
        setAuthMessages([]);
      }, 6000);
      return;
    }

    if (process === "set_password") delete data.confirm_password;

    setAuthMessages(["Processing..."]);

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
      const outcome = responseData.outcome;
      const responseMessage = responseData.message;
      if (outcome === "success_and_redirect_to_root") {
        window.location.href = `/brain${responseMessage ? `?message=${responseMessage}` : ''}`;
      } else if (outcome === "success_and_redirect_to_auth" || outcome === "failed_and_redirect_to_auth") {
        window.location.href = `/brain/auth${responseMessage ? `?message=${responseMessage}` : ''}`;
      } else if (outcome === "success") {
        setAuthMessages([responseMessage]);
      } else { // "failed"
        setAuthMessages(responseData.errors);
        const checkYourInbox = Array.isArray(responseData.errors) 
        ? responseData.errors.find((error) => error.includes('Check your inbox')) 
        : null;
        if (process !== "forgot_password" && !checkYourInbox) {
          setTimeout(() => {
            setAuthMessages([]);
          }, 6000);
        }
      }
    }
    catch (error) {
      console.error('Error during auth process:', error);
    }
    finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 3000);

      if (authMessages[0] === "Processing...") setAuthMessages([]);
    }
  }

  const toggleTabs = (event) => {
    document.querySelectorAll('.tabs-container button').forEach((tab) => tab.classList.remove('active'));
    event.target.classList.add('active');

    const forms = document.querySelectorAll('.auth-form');
    const targetIndex = event.target.dataset.index;
  
    // First, start the fade out
    forms.forEach((form) => {
      if (form.classList.contains('active')) {
        form.style.opacity = '0';
      }
      form.reset();
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
        setAuthMessages([]);
      });
    }, 300);
  }

  useEffect(() => {
    const loginButton = document.querySelector('.tabs-container button[data-index="0"]');
    if (loginButton) loginButton.click();
  }, []);

  return (
    <BrainBase header={`${authToken ? "shakey0.co.uk - set password": "Sign in to use Brain"}`} showLogOut={false}>
      <div className="main-container">
        {message && (
          <div className="message-container">
            <p>{message}</p>
          </div>
        )}

        {!authToken ? (
          <>
            <div className="tabs-container">
              <button className="active" data-index="0" onClick={toggleTabs} disabled={isSubmitting}>Log in</button>
              <button data-index="2" onClick={toggleTabs} disabled={isSubmitting}>Sign up</button>
            </div>

            <form className="auth-form log-in" onSubmit={handleSubmit}>
              {getFormFields.slice(1, 3).map((field) => (
                <AuthField key={field.name} field={field} />
              ))}
              <button type="button" className="forgot-password" data-index="1" onClick={toggleTabs} disabled={isSubmitting}>
                Forgot password?
              </button>
              <SubmitButton text="Log in" isSubmitting={isSubmitting} />
            </form>

            <form className="auth-form reset-pwd" onSubmit={handleSubmit}>
              <div className="into-container">
                <p>Enter your email address to receive a password reset link.</p>
              </div>
              <input type="hidden" name="from_section" value="brain" />
              <AuthField field={getFormFields[1]} />
              <SubmitButton text="Send password reset link" isSubmitting={isSubmitting} />
            </form>

            <form className="auth-form sign-up" onSubmit={handleSubmit}>
              <div className="into-container">
                {getSignUpInfo.map((message, index) => (
                  <InfoMessage key={index} message={message} />
                ))}
              </div>
              {/* https://chatgpt.com/c/6787d5a5-d024-8004-a997-37327f05f4cc - HANDLING ITEMS - KNOWLEDGE/LOGIC/MATH - DATA WITH DYNAMODB */}
              <input type="hidden" name="from_section" value="brain" />
              {getFormFields.slice(0, 2).map((field) => (
                <AuthField key={field.name} field={field} />
              ))}
              <SubmitButton text="Sign up" isSubmitting={isSubmitting} />
            </form>
          </>
        ) : (
          <form className="auth-form set-password active" style={{ opacity: 1 }} onSubmit={handleSubmit}>
            <div className="into-container">
              {getSetPasswordInfo.map((message, index) => (
                <InfoMessage key={index} message={message} />
              ))}
            </div>
            <input type="hidden" name="auth_token" value={authToken} />
            {getFormFields.slice(2, 4).map((field) => (
              <AuthField key={field.name} field={field} />
            ))}
            <SubmitButton text="Set password" isSubmitting={isSubmitting} />
          </form>
        )}

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
