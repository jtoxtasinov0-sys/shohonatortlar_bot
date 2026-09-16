import { useState } from 'react';
import { mediaUrl } from '../api';

/**
 * Rasm yuklanmasa chiroyli emoji-fon ko'rsatadi.
 * Manzil "/api/images/..." bo'lsa — backend manziliga ulab beradi.
 */
export default function SafeImage({ src, alt = '', emoji = '🍰', className = '' }) {
  const [failed, setFailed] = useState(false);
  const url = mediaUrl(src);

  if (!url || failed) {
    return <div className={`img-fallback ${className}`}>{emoji}</div>;
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
