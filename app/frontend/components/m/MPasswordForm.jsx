import { useState } from 'react';
import './MPasswordForm.scoped.scss';

const PasswordAuthForm = () => {
  const [password, setPassword] = useState('');

  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  
  return (
    <div className="password-auth-container">
      <form 
        action="/m_password_auth"
        method="POST" 
        className="password-auth-form"
      >
        <label htmlFor="password" className="label">Password:</label>
        <input type="hidden" name="authenticity_token" value={csrfToken} />
        <input 
          type="password" 
          id="password" 
          name="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="password-input"
        />
        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
};

export default PasswordAuthForm;
