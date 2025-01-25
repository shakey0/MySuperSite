const AuthField = ({ field }) => {
  return (
    <div className="input-container" key={field.name}>
      <label htmlFor={field.name}>{field.label}</label>
      <input type={field.type} name={field.name} />
    </div>
  );
};

export default AuthField;
