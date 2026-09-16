import { useState } from 'react';
import { mediaUrl } from '../api';

export default function Thumb({ src, emoji = '🍰' }) {
  const [failed, setFailed] = useState(false);
  const url = mediaUrl(src);
  if (!url || failed) return <div className="thumb-fallback">{emoji}</div>;
  return <img className="thumb" src={url} alt="" onError={() => setFailed(true)} />;
}
