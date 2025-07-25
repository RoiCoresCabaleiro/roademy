// src/utils/clipboard.js

export async function copyToClipboard(text) {
  // 1) API Clipboard
  // Falla cuando se intenta copiar desde un entorno no seguro (http) en Firefox, Opera o Safari (que lo exigen)
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // failback
    }
  }

  // 2) Fallback: execCommand está deprecated, pero se usa como último recurso
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
}