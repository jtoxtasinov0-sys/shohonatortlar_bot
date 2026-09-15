/**
 * Telegram WebApp bilan ishlash (brauzerda ham xatosiz ishlaydi).
 */
export const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

export function initTelegram() {
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    if (tg.setHeaderColor) tg.setHeaderColor('#ffffff');
    if (tg.setBackgroundColor) tg.setBackgroundColor('#ffffff');
    if (tg.disableVerticalSwipes) tg.disableVerticalSwipes();
  } catch (_) {
    /* eski Telegram versiyalari uchun */
  }
}

/** Telegramdagi foydalanuvchi ma'lumoti */
export function getTelegramUser() {
  return tg?.initDataUnsafe?.user || null;
}

/** Vibratsiya */
export function haptic(type = 'light') {
  try {
    if (!tg?.HapticFeedback) return;
    if (type === 'success' || type === 'error' || type === 'warning') {
      tg.HapticFeedback.notificationOccurred(type);
    } else {
      tg.HapticFeedback.impactOccurred(type);
    }
  } catch (_) {}
}

/** Orqaga tugmasi */
export function setBackButton(visible, handler) {
  if (!tg?.BackButton) return () => {};
  try {
    if (visible) {
      tg.BackButton.show();
      tg.BackButton.onClick(handler);
      return () => {
        tg.BackButton.offClick(handler);
        tg.BackButton.hide();
      };
    }
    tg.BackButton.hide();
  } catch (_) {}
  return () => {};
}

/** Mini App'ni yopish */
export function closeApp() {
  try {
    tg?.close();
  } catch (_) {}
}
