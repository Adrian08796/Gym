// src/components/Footer.jsx

import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-200 p-4 mt-8">
      <div className="container mx-auto text-center">
        <p>&copy; 2024 {t("Level Up. All rights reserved")}.</p>
      </div>
    </footer>
  );
}

export default Footer;