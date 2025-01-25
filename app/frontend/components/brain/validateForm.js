const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(process, data) {
  switch (process) {
    case "log_in":
      if (!emailRegex.test(data.email) || data.password.length < 8) {
        return ['Invalid email or password.'];
      }
      return [];
      
    case "sign_up":
      const signUpErrors = [];
      if (data.name.length < 2) {
        signUpErrors.push('Name/Nickname must be at least 2 characters.');
      } else if (data.name.length > 20) {
        signUpErrors.push('Name/Nickname cannot be more than 20 characters.');
      }
      if (!emailRegex.test(data.email)) {
        signUpErrors.push('Invalid email address.');
      }
      return signUpErrors;

    case "set_password":
      const passwordErrors = [];
      if (data.password.length < 8) {
        passwordErrors.push('Password must be at least 8 characters.');
      }
      if (data.password !== data.confirm_password) {
        passwordErrors.push('Passwords do not match.');
      }
      return passwordErrors;

    case "forgot_password":
      return !emailRegex.test(data.email) ? ['Invalid email address.'] : [];

    default:
      return ['Invalid process type.'];
  }
}

export default validateForm;
