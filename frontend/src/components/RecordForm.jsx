export function RecordForm({ resource, mode, value, onChange, onCancel, onSubmit, saving }) {
  const isEdit = mode === 'edit';
  const fields = resource.fields.filter((field) => !(mode === 'create' && field.auto));

  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        {fields.map((field) => {
          const isPk = resource.primaryKey.includes(field.name);
          const readOnly = isEdit && (isPk || field.auto);
          const fieldValue = value[field.name] ?? '';
          return (
            <div className="field" key={field.name}>
              <label htmlFor={field.name}>{field.label}{field.required ? ' *' : ''}</label>
              {field.type === 'select' ? (() => {
                const options = field.options || [];
                const mergedOptions = fieldValue !== '' && !options.includes(String(fieldValue))
                  ? [...options, String(fieldValue)]
                  : options;
                return (
                  <select
                    id={field.name}
                    value={fieldValue}
                    required={field.required}
                    disabled={readOnly}
                    onChange={(event) => onChange({ ...value, [field.name]: event.target.value })}
                  >
                    {mergedOptions.map((option) => <option key={option} value={option}>{option === '' ? '—' : option}</option>)}
                  </select>
                );
              })() : (
                <input
                  id={field.name}
                  type={field.type || 'text'}
                  step={field.step}
                  value={fieldValue}
                  required={field.required}
                  readOnly={readOnly}
                  onChange={(event) => onChange({ ...value, [field.name]: event.target.value })}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="form-actions">
        <button className="btn ghost" type="button" onClick={onCancel}>Annuler</button>
        <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
      </div>
    </form>
  );
}