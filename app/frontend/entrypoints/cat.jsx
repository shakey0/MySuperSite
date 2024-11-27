import { createRoot } from 'react-dom/client';
import Cat from '../components/cats/Cat';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('cat-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<Cat />);
  }
});
