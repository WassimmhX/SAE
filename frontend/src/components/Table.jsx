export function Table({ resource, filtered, visibleRows, setPage, rowKey, formatValue, openEdit, openDelete, safePage, pageCount }) {
    return (
        <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {resource.tableColumns.map((column) => <th key={column}>{resource.fields.find((field) => field.name === column)?.label || column}</th>)}
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={rowKey(resource, row)}>
                      {resource.tableColumns.map((column) => <td key={column}>{formatValue(column, row[column])}</td>)}
                      <td>
                        <div className="row-actions">
                          <button className="btn ghost" type="button" onClick={() => openEdit(row)}>Modifier</button>
                          <button className="btn danger" type="button" onClick={() => openDelete(row)}>Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 ? <div className="empty">Aucune donnée trouvée.</div> : null}
            <div className="pagination">
              <span>{filtered.length.toLocaleString('fr-FR')} résultat{filtered.length > 1 ? 's' : ''} · page {safePage}/{pageCount}</span>
              <div className="pagination-controls">
                <button className="btn ghost" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Précédent</button>
                <button className="btn ghost" disabled={safePage >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>Suivant</button>
              </div>
            </div>
          </>
    )
}