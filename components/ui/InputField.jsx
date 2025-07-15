const InputField = ({
  icon,
  label,
  id,
  name, // <-- add this
  type,
  value,
  onChange,
  placeholder,
  error,
}) => (
  <div className="relative">
    <label htmlFor={id} className="block text-sm font-medium text-gray-600">
      {label}
    </label>
    <div className="mt-1 flex items-center">
      <div className="absolute ml-3 text-gray-400">{icon}</div>
      <input
        id={id}
        name={name} // <-- this is what you were missing
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
          error ? "border-red-500" : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
        placeholder={placeholder}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
export default InputField;
