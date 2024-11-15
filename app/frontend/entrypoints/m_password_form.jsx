import { createRoot } from 'react-dom/client';
import MPasswordForm from '../components/m/MPasswordForm';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('m-password-form-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<MPasswordForm/>);
  }
});
