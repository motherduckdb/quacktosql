import React from "react";

interface LanguageSelectorProps {
  language: string;
  setLanguage: (lang: string) => void;
}

export function LanguageSelector({ language, setLanguage }: LanguageSelectorProps) {
  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "es", name: "Spanish" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "nl", name: "Dutch" },
    { code: "pl", name: "Polish" },
    { code: "ru", name: "Russian" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
  ];

  return (
    <select
      className="border rounded-lg px-2 py-1 bg-white dark:bg-gray-800"
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
    >
      {languages.map(({ code, name }) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
} 
