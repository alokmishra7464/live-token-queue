export default function QueueTable({ queue, onAction }) {
  if (queue.length === 0) return <p className="muted">Queue is empty.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Token</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {queue.map((t) => (
            <tr key={t._id} className={t.status === 'serving' ? 'row-serving' : ''}>
              <td><strong>{t.label}</strong></td>
              <td>{t.phone}</td>
              <td>{t.status}</td>
              <td className="actions">
                {t.status === 'serving' && (
                  <button className="btn small" onClick={() => onAction(`/admin/${t._id}/done`)}>Done</button>
                )}
                <button className="btn small danger" onClick={() => onAction(`/admin/${t._id}/skip`)}>Skip</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
