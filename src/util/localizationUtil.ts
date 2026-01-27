export interface LangDetails {
  langCode: string;
  langName: string;
}

// default langugage
export const defaultLang = "English(EN)";

export const getLangName = (lang: string): string => {
  return lang?.split("(")[0];
};

export const getLangCode = (lang: string): string => {
  var langCode = lang?.split("(")[1];
  return langCode?.substring(0, langCode.length - 1);
};

export const getDefaultLangDetails = (): LangDetails => {
  var langCode = getLangCode(defaultLang);
  var langName = getLangName(defaultLang);
  return {
    langCode: langCode,
    langName: langName,
  };
};

export const getLangDetails = (lang: string): LangDetails => {
  var langCode = getLangCode(lang);
  var langName = getLangName(lang);
  return {
    langCode: langCode,
    langName: langName,
  };
};

export const getSelectedLang = (languages: string[]): string => {
  if (languages && languages[0]) {
    return languages[0];
  }

  return defaultLang;
};

export const getUpdatedSelectedLang = (
  languages: string[],
  sessLang: string
): string => {
  if (!languages) {
    return defaultLang;
  }

  let selectedLang = languages?.find((lang) => lang === sessLang);
  if (selectedLang) {
    return selectedLang;
  }

  return languages?.[0] ? languages[0] : defaultLang;
};

export const getLang = (sessionLang: string) => {
  return sessionLang ? sessionLang : defaultLang;
};
