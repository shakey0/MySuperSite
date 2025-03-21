import './SubmitButton.scoped.scss';

const SubmitButton = ({ text, disabled, manualHandling = false, onClick }) => {
  return (
    manualHandling ? (
      <button className="submit-button" type="button" disabled={disabled} onClick={onClick}>
        {text}
      </button>
    ) : (
      <button className="submit-button" type="submit" disabled={disabled}>
        {text}
      </button>
    )
  );
};

export default SubmitButton;
