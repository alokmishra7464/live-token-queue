import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import OtpPopup from '../components/OtpPopup.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState(''); // OTP shown in the pop-up
  const [error, setError] = useState('');
  const [wait, setWait] = useState(0); // seconds until "Resend" is allowed

  // Count down the 30 second resend timer
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;

  const sendOtp = async () => {
    setError('');
    try {
      const data = await api('/auth/request-otp', { method: 'POST', body: { phone } });
      setStep('otp');
      setOtp('');
      setWait(30);
      setDemoOtp(data.otp); // show the pop-up
    } catch (e) {
      setError(e.message);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/auth/verify-otp', { method: 'POST', body: { phone, otp } });
      login(data.token, data.user);
    } catch (e) {
      setError(e.message);
    }
  };

  // "Use this OTP" fills the box and closes the pop-up
  const useDemoOtp = () => {
    setOtp(demoOtp);
    setDemoOtp('');
  };

  return (
    <div className="card">
      <h2>Log in</h2>

      {step === 'phone' ? (
        <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }}>
          <label>Phone number</label>
          <input type="tel" placeholder="9876543210" value={phone}
                 onChange={(e) => setPhone(e.target.value)} required />
          <button className="btn">Send OTP</button>
        </form>
      ) : (
        <form onSubmit={verifyOtp}>
          <label>Enter the 6-digit OTP for {phone}</label>
          <input inputMode="numeric" maxLength={6} placeholder="123456" value={otp}
                 onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required />
          <button className="btn">Verify &amp; log in</button>
          <button type="button" className="btn ghost" disabled={wait > 0} onClick={sendOtp}>
            {wait > 0 ? `Resend OTP in ${wait}s` : 'Resend OTP'}
          </button>
          <button type="button" className="link" onClick={() => setStep('phone')}>Change number</button>
        </form>
      )}

      <ErrorMessage text={error} />

      <OtpPopup otp={demoOtp} onUse={useDemoOtp} onClose={() => setDemoOtp('')} />
    </div>
  );
}