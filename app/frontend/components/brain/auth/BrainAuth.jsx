import { useState, useEffect, useRef } from 'react';
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
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [logInRef, resetPwdRef, signUpRef] = [useRef(0), useRef(1), useRef(2)];
  const [logInFormRef, resetPwdFormRef, signUpFormRef] = [useRef(null), useRef(null), useRef(null)];

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
      setAuthMessages(['Sorry, an error occurred. Please try again.']);
    }
    finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 3000);
    }
  }

  const toggleTabs = (tabRef) => {
    setIsFormVisible(false);

    const formRefs = {
      [logInRef.current]: logInFormRef,
      [resetPwdRef.current]: resetPwdFormRef,
      [signUpRef.current]: signUpFormRef
    };
    const currentForm = formRefs[activeTabIndex]?.current;
    if (currentForm) {
      currentForm.reset();
    }

    setActiveTabIndex(tabRef.current);
    setAuthMessages([]);
    requestAnimationFrame(() => {
      setIsFormVisible(true);
    });
  };

  useEffect(() => {
    toggleTabs(logInRef);
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
              <button 
                className={activeTabIndex === logInRef.current ? 'active' : ''} 
                onClick={() => toggleTabs(logInRef)} 
                disabled={isSubmitting}
              >
                Log in
              </button>
              <button 
                className={activeTabIndex === signUpRef.current ? 'active' : ''} 
                onClick={() => toggleTabs(signUpRef)} 
                disabled={isSubmitting}
              >
                Sign up
              </button>
            </div>

            <form 
              ref={logInFormRef}
              className="auth-form log-in"
              style={{ 
                opacity: activeTabIndex === logInRef.current && isFormVisible ? 1 : 0,
                display: activeTabIndex === logInRef.current ? 'flex' : 'none'
              }}
              onSubmit={handleSubmit}
            >
              {getFormFields.slice(1, 3).map((field) => (
                <AuthField key={field.name} field={field} />
              ))}
              <button 
                type="button" 
                className="forgot-password" 
                onClick={() => toggleTabs(resetPwdRef)} 
                disabled={isSubmitting}
              >
                Forgot password?
              </button>
              <SubmitButton text="Log in" disabled={isSubmitting} />
            </form>

            <form 
              ref={resetPwdFormRef}
              className="auth-form reset-pwd"
              style={{ 
                opacity: activeTabIndex === resetPwdRef.current && isFormVisible ? 1 : 0,
                display: activeTabIndex === resetPwdRef.current ? 'flex' : 'none'
              }}
              onSubmit={handleSubmit}
            >
              <div className="into-container">
                <p>Enter your email address to receive a password reset link.</p>
              </div>
              <input type="hidden" name="from_section" value="brain" />
              <AuthField field={getFormFields[1]} />
              <SubmitButton text="Send password reset link" disabled={isSubmitting} />
            </form>

            <form 
              ref={signUpFormRef}
              className="auth-form sign-up"
              style={{ 
                opacity: activeTabIndex === signUpRef.current && isFormVisible ? 1 : 0,
                display: activeTabIndex === signUpRef.current ? 'flex' : 'none'
              }}
              onSubmit={handleSubmit}
            >
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
              <SubmitButton text="Sign up" disabled={isSubmitting} />
            </form>
          </>
        ) : (
          <form className="auth-form set-password" onSubmit={handleSubmit}>
            <div className="into-container">
              {getSetPasswordInfo.map((message, index) => (
                <InfoMessage key={index} message={message} />
              ))}
            </div>
            <input type="hidden" name="auth_token" value={authToken} />
            {getFormFields.slice(2, 4).map((field) => (
              <AuthField key={field.name} field={field} />
            ))}
            <SubmitButton text="Set password" disabled={isSubmitting} />
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
