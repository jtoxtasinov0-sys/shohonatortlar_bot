import { useEffect, useState } from 'react';
import { useApp } from '../store';
import { haptic } from '../telegram';
import { pickText, pickTitle, storage } from '../utils';
import SafeImage from './SafeImage';

/**
 * Bosh sahifadagi doira shaklidagi storylar + to'liq ekranli ko'rinish.
 */
export default function Stories() {
  const { catalog, lang } = useApp();
  const [openIndex, setOpenIndex] = useState(null);
  const [seen, setSeen] = useState(() => storage.get('sht_seen_stories', []));

  const stories = catalog.stories || [];
  if (!stories.length) return null;

  const open = (index) => {
    haptic('light');
    setOpenIndex(index);
    const id = stories[index].id;
    if (!seen.includes(id)) {
      const next = [...seen, id];
      setSeen(next);
      storage.set('sht_seen_stories', next);
    }
  };

  return (
    <>
      <div className="stories">
        {stories.map((story, index) => (
          <button key={story.id} className="story" onClick={() => open(index)}>
            <div className={`story-ring ${seen.includes(story.id) ? 'seen' : ''}`}>
              <SafeImage src={story.imageUrl} alt="" emoji="✨" className="story-img" />
            </div>
            <span>{pickTitle(story, lang)}</span>
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <StoryViewer
          stories={stories}
          startIndex={openIndex}
          lang={lang}
          onClose={() => setOpenIndex(null)}
          onSeen={(id) => {
            if (!seen.includes(id)) {
              const next = [...seen, id];
              setSeen(next);
              storage.set('sht_seen_stories', next);
            }
          }}
        />
      )}
    </>
  );
}

function StoryViewer({ stories, startIndex, lang, onClose, onSeen }) {
  const [index, setIndex] = useState(startIndex);
  const story = stories[index];

  useEffect(() => {
    onSeen(story.id);
    const timer = setTimeout(() => {
      if (index < stories.length - 1) setIndex((i) => i + 1);
      else onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  const prev = () => (index > 0 ? setIndex(index - 1) : onClose());
  const next = () => (index < stories.length - 1 ? setIndex(index + 1) : onClose());

  return (
    <div className="story-view">
      <SafeImage src={story.imageUrl} alt="" emoji="✨" className="story-bg" />

      <div className="story-bars">
        {stories.map((s, i) => (
          <div
            key={s.id}
            className={`story-bar ${i < index ? 'done' : ''} ${i === index ? 'active' : ''}`}
          >
            <i key={`${s.id}-${index}`} />
          </div>
        ))}
      </div>

      <button className="story-close" onClick={onClose}>
        ✕
      </button>

      <div className="story-nav">
        <div onClick={prev} />
        <div onClick={next} />
      </div>

      <div className="story-content">
        <h3>{pickTitle(story, lang)}</h3>
        <p>{pickText(story, lang)}</p>
      </div>
    </div>
  );
}
