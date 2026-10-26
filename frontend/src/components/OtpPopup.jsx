// Demo-only pop-up that plays the role of the SMS message
export default function OtpPopup({ otp, onUse, onClose }) {
  if (!otp) return null;

  return (
    <div className="popup-backdrop">
      <div className="popup" role="dialog" aria-label="Your OTP">
        <p className="muted">Demo SMS · Your OTP is</p>
        <p className="otp-code">{otp}</p>
        <p className="muted small-text">Valid for 5 minutes</p>
        <button className="btn" onClick={onUse}>Use this OTP</button>
        <button className="link" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}