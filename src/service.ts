import { pluginLogger } from './index';

export const getLocaleName = (locale: string) => {
  if (locale === '' || locale == null) {
    return '';
  }
  try {
    const languageNames = new Intl.DisplayNames([locale], {
      type: 'language',
    });
    return languageNames.of(locale);
  } catch (e) {
    pluginLogger.error('Error getting locale name', { logCode: 'live_transcription_locale_name_error', extraInfo: { locale, error: e } });
    return locale;
  }
};

export const mostSimilarLanguage = (targetLanguage: string, availableLanguages: string[]) => {
  // First, check if there is an exact match in the available locales
  if (availableLanguages.includes(targetLanguage)) {
    return targetLanguage;
  }

  // extracts only the language, without the region to find a match. "en-US" -> "en" for example
  const languageCode = targetLanguage.split('-')[0];

  // in case there is no similar language, falls back to the first available one
  let matchedLocale = availableLanguages[0];
  availableLanguages.forEach((locale) => {
    if (locale.startsWith(languageCode)) {
      matchedLocale = locale;
    }
  });

  return matchedLocale;
};
