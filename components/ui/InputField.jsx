const InputField = ({
  icon,
  label,
  id,
  type,
  value,
  onChange,
  placeholder,
}) => (
  <div className="relative">
    <label htmlFor={id} className="block text-sm font-medium text-gray-600">
      {label}
    </label>
    <div className="mt-1 flex items-center">
      <div className="absolute ml-3 text-gray-400">{icon}</div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
        placeholder={placeholder}
      />
    </div>
  </div>
);
export default InputField;
