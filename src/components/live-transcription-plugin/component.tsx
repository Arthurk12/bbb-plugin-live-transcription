import React, {
  ReactNode,
  useEffect,
} from 'react';
import * as ReactDOM from 'react-dom/client';
import { createIntl, createIntlCache, defineMessages } from 'react-intl';
import { GenericContentSidekickArea } from 'bigbluebutton-html-plugin-sdk';
import { LiveTranscriptionPluginProps } from '../types';
import { useLiveTranscriptionStore } from '../../context';
import { SettingsProvider, useCaptionEnabled, useLiveTranscriptionDisabled } from '../../context/settings/context';
import { LiveTranscriptionPanel } from '../live-transcription-panel/component';
import { StartedLiveTranscription } from '../started-live-transcription/component';
import useEnableTranscription from '../../hooks/useEnableTranscription';
import { pluginLogger } from '../..';

const intlMessages = defineMessages({
  sidekickSectionName: {
    id: 'sidekick.section.name',
    description: 'Name of the sidekick panel section',
    defaultMessage: 'Captions',
  },
  sidekickButtonTitle: {
    id: 'sidekick.panel.buttonTitle',
    description: 'Title of the sidekick panel foreach live-transcription menu ',
    defaultMessage: 'Live Transcription',
  },
});

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

  const captionEnabled = useCaptionEnabled();
  const liveTranscriptionDisabled = useLiveTranscriptionDisabled();
  const requiredFeaturesEnabled = captionEnabled && !liveTranscriptionDisabled;
  const { activeLocale } = useLiveTranscriptionStore();

  const currentUser = pluginApi.useCurrentUser!();
  const {
    data: currentUserData,
    loading: currentUserLoading,
  } = currentUser || {};
  const isMod = !currentUserLoading && currentUserData && currentUserData.role === 'MODERATOR';

  const transcriptionStarted = useEnableTranscription(pluginApi, Boolean(isMod));

  useEffect(() => {
    if (!intl || !requiredFeaturesEnabled) return;
    let sidekickPanel: GenericContentSidekickArea | undefined;
    if (isMod) {
      pluginLogger.debug('Initializing sidekick panel for moderators', { logCode: 'live_transcription_init_mod_panel', extraInfo: { uuid, intl, activeLocale } });
      sidekickPanel = new GenericContentSidekickArea({
        id: `live-transcription-${uuid}`,
        name: intl.formatMessage(intlMessages.sidekickButtonTitle),
        buttonIcon: 'closed_caption',
        section: intl.formatMessage(intlMessages.sidekickSectionName),
        open: false,
        contentFunction: (element: HTMLElement) => {
          const root = ReactDOM.createRoot(element);
          root.render(
            <SettingsProvider pluginApi={pluginApi}>
              <LiveTranscriptionPanel
                pluginApi={pluginApi}
                initialLocale={activeLocale || currentLocale}
                intl={intl}
              />
            </SettingsProvider>,
          );
          return root;
        },
      });
    }
    if (!isMod && transcriptionStarted) {
      pluginLogger.debug('Initializing sidekick panel for viewers', { logCode: 'live_transcription_init_viewer_panel', extraInfo: { uuid, intl, activeLocale } });
      sidekickPanel = new GenericContentSidekickArea({
        id: `live-transcription-${uuid}`,
        name: intl.formatMessage(intlMessages.sidekickButtonTitle),
        buttonIcon: 'closed_caption',
        section: intl.formatMessage(intlMessages.sidekickSectionName),
        open: true,
        contentFunction: (element: HTMLElement) => {
          const root = ReactDOM.createRoot(element);
          root.render(
            <SettingsProvider pluginApi={pluginApi}>
              <StartedLiveTranscription
                pluginApi={pluginApi}
                locale={currentLocale}
                intl={intl}
              />
            </SettingsProvider>,
          );
          return root;
        },
      });
    }
    if (sidekickPanel) pluginApi.setGenericContentItems([sidekickPanel]);
  }, [currentLocale, localeMessages, requiredFeaturesEnabled, transcriptionStarted, isMod]);

  return null;
}
