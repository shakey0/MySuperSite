import { createRoot } from 'react-dom/client';
import M from '../components/M';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('m-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<M />);
  }
});
