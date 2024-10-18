import React from 'react';
import { useTranslation } from 'react-i18next';
import AppGuide from './AppGuide';

function AppGuideModal({ isOpen, onClose }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{t("Welcome to Level Up!")}</h2>
        <AppGuide />
        <button 
          onClick={onClose}
          className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600"
        >
          {t("Got it, let's start!")}
        </button>
      </div>
    </div>
  );
}

export default AppGuideModal;