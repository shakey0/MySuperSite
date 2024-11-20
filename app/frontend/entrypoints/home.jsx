import { createRoot } from 'react-dom/client';
import Home from '../components/home/Home';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('home-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<Home />);
  }
});
