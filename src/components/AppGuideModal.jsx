// src/components/AppGuideModal.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import AppGuide from './AppGuide';
import './AppGuideModal.css';

function AppGuideModal({ isOpen, onClose }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="app-guide-modal-overlay" onClick={onClose}>
      <div className="app-guide-modal" onClick={e => e.stopPropagation()}>
        <h2 className="app-guide-modal-title">{t("Welcome to Level Up!")}</h2>
        <AppGuide />
        <button 
          onClick={onClose}
          className="app-guide-modal-close-btn"
        >
          {t("Got it, let's start!")}
        </button>
      </div>
    </div>
  );
}

export default AppGuideModal;