import { pluginLogger } from 'bigbluebutton-html-plugin-sdk';

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
    pluginLogger.error('Error getting locale name for locale', locale, e);
    return locale;
  }
};
