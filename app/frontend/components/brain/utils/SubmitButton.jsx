import './SubmitButton.scoped.scss';

const SubmitButton = ({ text, isSubmitting }) => {
  return (
    <button className="submit-button" type="submit" disabled={isSubmitting}>
      {text}
    </button>
  );
};

export default SubmitButton;
