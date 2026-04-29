import React, {
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as ReactDOM from 'react-dom/client';
import { createIntl, createIntlCache, defineMessages } from 'react-intl';
import { GenericContentSidekickArea, pluginLogger } from 'bigbluebutton-html-plugin-sdk';
import { GET_CAPTION_ACTIVE_LOCALES, GET_CAPTION_SETTINGS } from './queries';
import { CaptionActiveLocaleGraphqlResponse, CaptionSettingsGraphqlResponse, LiveTranscriptionPluginProps } from './types';
import { LiveTranscriptionSidekickContent } from '../sidekick-content/container';

const intlMessages = defineMessages({
  sidekickSectionName: {
    id: 'sidekick.section.name',
    description: 'Name of the sidekick panel section',
    defaultMessage: 'Captions',
  },
  sidekickMenuTitle: {
    id: 'sidekick.panel.title',
    description: 'Title of the sidekick panel foreach live-transcription menu ',
    defaultMessage: 'Live Transcription',
  },
});

const LIVE_TRANSCRIPTION_DISABLED_FEATURE = 'liveTranscription';

const LOCALE_REQUEST_OBJECT = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
  ? {
    headers: {
      'ngrok-skip-browser-warning': 'any',
    },
  } : undefined;

export function LiveTranscriptionPlugin(
  { pluginApi, uuid }: LiveTranscriptionPluginProps,
): ReactNode {
  const {
    messages: localeMessages,
    currentLocale,
    loading: localeMessagesLoading,
  } = pluginApi.useLocaleMessages!(LOCALE_REQUEST_OBJECT);

  const cache = createIntlCache();
  const intl = (!localeMessagesLoading && localeMessages) ? createIntl({
    locale: currentLocale,
    messages: localeMessages,
    fallbackOnEmptyString: true,
  }, cache) : null;

  const [permissionToLoad, setPermissionToLoad] = useState(true);
  const sideKickPanelId = useRef('');

  const { data: captionActiveLocalesResult } = pluginApi.useCustomSubscription!<
  CaptionActiveLocaleGraphqlResponse>(
    GET_CAPTION_ACTIVE_LOCALES,
  );

  const { data: captionSettings } = pluginApi.useCustomQuery!<
  CaptionSettingsGraphqlResponse>(
    GET_CAPTION_SETTINGS,
  );

  useEffect(() => {
    const areThereCaptionsToShow = captionActiveLocalesResult
      && captionActiveLocalesResult.caption_activeLocales.length > 0;
    if (intl && permissionToLoad && areThereCaptionsToShow && sideKickPanelId.current === '') {
      const sidekickPanel = new GenericContentSidekickArea({
        id: `live-transcription-${uuid}`,
        name: intl.formatMessage(intlMessages.sidekickMenuTitle),
        buttonIcon: 'closed_caption',
        section: intl.formatMessage(intlMessages.sidekickSectionName),
        open: false,
        contentFunction: (element: HTMLElement) => {
          const root = ReactDOM.createRoot(element);
          root.render(
            (<LiveTranscriptionSidekickContent
              initialLocale={captionActiveLocalesResult.caption_activeLocales[0].locale}
              pluginApi={pluginApi}
              intl={intl}
            />),
          );
          return root;
        },
      });
      [sideKickPanelId.current] = pluginApi.setGenericContentItems([sidekickPanel]);
    }
  }, [captionActiveLocalesResult, intl, permissionToLoad]);

  useEffect(() => {
    if (captionSettings) {
      const meetingSettings = captionSettings.meeting[0];
      const liveTranscriptionDisabled = meetingSettings.disabledFeatures.includes(
        LIVE_TRANSCRIPTION_DISABLED_FEATURE,
      );
      const captionEnabled = meetingSettings.captionSettings.audioCaptionEnabled
        && meetingSettings.captionSettings.audioCaptionAvailableLanguages.length >= 0;

      if (!captionEnabled || liveTranscriptionDisabled) setPermissionToLoad(false);

      const errorMessage = 'Plugin live-transcription will not work';
      if (liveTranscriptionDisabled) {
        pluginLogger.warn(`${errorMessage} because disabled-features contains liveTranscription`);
      }
      if (!captionEnabled) {
        pluginLogger.warn(
          `${errorMessage} because settings audioCaptions is not enabled or doesn't contain a list of available caption language`,
        );
      }
    }
  }, [captionSettings]);

  return null;
}
