const getFormFields = [
  { label: 'Name/Nickname', name: 'name', type: 'text' },
  { label: 'Email', name: 'email', type: 'text' },
  { label: 'Password', name: 'password', type: 'password' },
  { label: 'Confirm password', name: 'confirm_password', type: 'password' },
];

const getSignUpInfo = [
  {
    text: "This sign up will be valid for all services across shakey0.co.uk that require an account."
  },
  {
    text: "shakey0.co.uk will use cookies to quickly identify your account and make your experience as smooth as possible."
  },
  {
    text: "By signing up, you agree to the {terms} and {privacy}.",
    links: {
      terms: {
        text: "Terms of Service",
        href: "/terms-of-service"  // Update with your actual path
      },
      privacy: {
        text: "Privacy Policy",
        href: "/privacy-policy"    // Update with your actual path
      }
    }
  }
];

const getSetPasswordInfo = [
  {
    text: "Set a password for your shakey0.co.uk account."
  },
  {
    text: "This password will be used to log in to all services across shakey0.co.uk"
  },
  {
    text: "Your password must be at least 8 characters long."
  }
];

export { getFormFields, getSignUpInfo, getSetPasswordInfo };
