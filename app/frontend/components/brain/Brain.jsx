import './BrainFeatures.scss';

export default function Brain() {
  // THIS WILL GO INTO BRAINBASE.JSX IN THE MENU COMPONENT
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/log_out', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
      });

      const responseData = await response.json();
      if (responseData.outcome === "success") {
        window.location.href = '/brain/auth';
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div>
      Hello Brain!
      
      <form onSubmit={handleSubmit}>
        <button type="submit">Log out</button>
      </form>
    </div>
  );
}
