export default function FormField({ label, name, value, onChange, required = false, wide = false, options, type = 'text', placeholder = '', min, step }) {
  return <label className={`field ${wide ? 'wide' : ''}`}>
    <span>{label}{required && <b> *</b>}</span>
    {options
      ? <select value={value} onChange={event => onChange(name, event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select>
      : <input type={type} value={value} onChange={event => onChange(name, event.target.value)} placeholder={placeholder} required={required} min={min} step={step} />}
  </label>
}
