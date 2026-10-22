import { useState, useCallback } from 'react';
import { api } from '../api.js';
import useQueueUpdates from '../hooks/useQueueUpdates.js';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function Customer() {
  const [status, setStatus] = useState(null); // { token, nowServing, ahead }
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setStatus(await api('/tokens/me'));
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useQueueUpdates(load); // live updates via socket

  const getToken = async () => {
    setError('');
    try {
      setStatus(await api('/tokens', { method: 'POST' }));
    } catch (e) {
      setError(e.message);
    }
  };

  if (!status) return <p className="center">Loading...</p>;

  const { token, nowServing, ahead } = status;
  const hasActive = token && (token.status === 'waiting' || token.status === 'serving');

  return (
    <div className="card center">
      <p className="muted">Now serving</p>
      <p className="big">{nowServing || '—'}</p>

      {hasActive ? (
        <>
          <p className="muted">Your token</p>
          <p className="big accent">{token.label}</p>
          {token.status === 'serving' ? (
            <p className="banner">It's your turn! Please go to the counter.</p>
          ) : (
            <p>{ahead} {ahead === 1 ? 'person' : 'people'} ahead</p>
          )}
        </>
      ) : (
        <>
          {token?.status === 'served' && <p>Thank you! Your visit is complete.</p>}
          {token?.status === 'skipped' && <p>You were marked as a no-show.</p>}
          <button className="btn" onClick={getToken}>Get Token</button>
        </>
      )}

      <ErrorMessage text={error} />
    </div>
  );
}
