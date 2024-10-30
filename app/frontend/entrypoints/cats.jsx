import { createRoot } from 'react-dom/client';
import Cats from '../components/Cats';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('cats-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<Cats />);
  }
});
