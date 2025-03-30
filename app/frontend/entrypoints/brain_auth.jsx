import { createRoot } from 'react-dom/client';
import BrainAuth from '../components/brain/auth/BrainAuth';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('brain-auth-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<BrainAuth />);
  }
});
