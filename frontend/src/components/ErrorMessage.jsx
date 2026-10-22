export default function ErrorMessage({ text }) {
  return text ? <p className="error">{text}</p> : null;
}
