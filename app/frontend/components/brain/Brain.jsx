import './BrainFeatures.scss';

export default function Brain() {
  // THIS WILL GO INTO BRAINBASE.JSX IN THE MENU COMPONENT
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  return (
    <div>
      Hello Brain!
      
      <form action="/brain/log_out" method="post">
        <input type="hidden" name="authenticity_token" value={csrfToken} />
        <button type="submit">Log out</button>
      </form>
    </div>
  );
}
