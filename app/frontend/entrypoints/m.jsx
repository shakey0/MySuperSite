import { createRoot } from 'react-dom/client';
import M from '../components/m/M';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('m-root');
  const admin = rootElement.getAttribute('data-admin');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<M admin={admin} />);
  }
});
