import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import global_en from "./translation/en/global.json"
import global_cn from "./translation/cn/global.json"
import i18next from "i18next";
import { I18nextProvider } from "react-i18next";


i18next.init({
    resources: {
      en: { global: global_en },
      cn: { global: global_cn },
    },
    lng: "en", 
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });


createRoot(document.getElementById("root")!).render(
    <I18nextProvider i18n={i18next}>
      <App />
    </I18nextProvider>
  );