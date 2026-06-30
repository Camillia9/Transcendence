export default function InputField({ label, type, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`bg-gray-700 text-white px-4 py-2 rounded-lg outline-none border-2 transition
          ${error ? 'border-red-500' : 'border-transparent focus:border-primary-500'}`}
      />
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  )
}

// Champ complet pour formulaire avec UX (label + erreurs + styles dynamiques)
// type = type du champs a rentre
// value = input controle par React
// onChange = declanche quand on tape
