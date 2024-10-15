// src/components/LanguageSwitcher.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="bg-gray-700 text-white rounded p-1 text-sm"
    >
      <option value="en">EN</option>
      <option value="de">DE</option>
    </select>
  );
}

export default LanguageSwitcher;