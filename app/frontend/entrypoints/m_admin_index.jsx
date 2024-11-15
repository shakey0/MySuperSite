import { createRoot } from 'react-dom/client';
import MAdminIndex from '../components/m/MAdminIndex';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('m-admin-index-root');
  const filenames = rootElement.getAttribute('data-filenames');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<MAdminIndex filenames={filenames} />);
  }
});
