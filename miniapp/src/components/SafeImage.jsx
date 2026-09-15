import { useState } from 'react';

/**
 * Rasm yuklanmasa chiroyli emoji-fon ko'rsatadi.
 */
export default function SafeImage({ src, alt = '', emoji = '🍰', className = '' }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className={`img-fallback ${className}`}>{emoji}</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
