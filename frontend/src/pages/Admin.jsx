import { useState, useCallback } from 'react';
import { api } from '../api.js';
import useQueueUpdates from '../hooks/useQueueUpdates.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import QueueTable from '../components/QueueTable.jsx';

export default function Admin() {
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setQueue(await api('/admin/queue'));
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useQueueUpdates(load);

  // One function for every button: Next / Done / Skip
  const act = async (path) => {
    setError('');
    try {
      await api(path, { method: 'POST' });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const serving = queue.find((t) => t.status === 'serving');
  const waiting = queue.filter((t) => t.status === 'waiting').length;

  return (
    <div className="card wide">
      <h2>Queue</h2>
      <p className="muted">
        Now serving: <strong>{serving ? serving.label : 'nobody'}</strong> · Waiting: <strong>{waiting}</strong>
      </p>

      <button className="btn" disabled={!!serving || waiting === 0} onClick={() => act('/admin/next')}>
        Next
      </button>

      <ErrorMessage text={error} />
      <QueueTable queue={queue} onAction={act} />
    </div>
  );
}
