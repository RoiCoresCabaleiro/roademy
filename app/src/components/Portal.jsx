// src/components/Portal.jsx

import { createPortal } from 'react-dom';

export default function Portal({ children }) {
  return createPortal(children, document.body);
}
