import { useState } from 'react';

export default function Thumb({ src, emoji = '🍰' }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className="thumb-fallback">{emoji}</div>;
  return <img className="thumb" src={src} alt="" onError={() => setFailed(true)} />;
}
