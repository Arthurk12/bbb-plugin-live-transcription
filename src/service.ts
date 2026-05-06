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
