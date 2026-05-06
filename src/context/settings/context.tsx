import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { pluginLogger } from 'bigbluebutton-html-plugin-sdk';
import {
  ClientSettings,
  MeetingDisabledFeaturesResponse,
  Settings,
  SettingsContextType,
  SettingsProviderProps,
} from './types';
import { GET_MEETING_DISABLED_FEATURES } from '../../components/queries';

const SETTINGS_NAME = 'LiveTranscriptionPlugin';
const DEFAULT_SPEECH_PROVIDER = 'webspeech';
const LIVE_TRANSCRIPTION_DISABLED_FEATURE = 'liveTranscription';

const SettingsContext = createContext<SettingsContextType | null>(null);

declare global {
  interface Window {
    meetingClientSettings?: ClientSettings;
  }
}

function SettingsProvider(props: SettingsProviderProps) {
  const { children, pluginApi } = props;
  const [debug, setDebug] = useState<boolean>(false);
  const [panelImageUrl, setPanelImageUrl] = useState<string | undefined>(undefined);
  const [speechProvider, setSpeechProvider] = useState<string>(DEFAULT_SPEECH_PROVIDER);
  const [captionEnabled, setCaptionEnabled] = useState<boolean>(false);
  const [enabledLocales, setEnabledLocales] = useState<string[]>([]);

  const { data: disabledFeaturesData } = pluginApi.useCustomSubscription!<
    MeetingDisabledFeaturesResponse>(GET_MEETING_DISABLED_FEATURES);

  const liveTranscriptionDisabled = useMemo(() => {
    const meeting = disabledFeaturesData?.meeting?.[0];
    return meeting?.disabledFeatures.includes(LIVE_TRANSCRIPTION_DISABLED_FEATURE) ?? false;
  }, [disabledFeaturesData]);

  useEffect(() => {
    const publicSettings = window.meetingClientSettings?.public;
    if (!publicSettings) {
      pluginLogger.warn('No public settings found in meetingClientSettings', { logCode: 'live_transcription_no_public_settings' });
      return;
    }
    const { plugins, app } = publicSettings;
    if (!plugins) {
      pluginLogger.warn('No plugins array found in public settings', { logCode: 'live_transcription_no_plugins_settings' });
    }
    if (!app) {
      pluginLogger.warn('No app settings found in public settings', { logCode: 'live_transcription_no_app_settings' });
    }
    const { audioCaptions } = app || {};
    if (audioCaptions?.provider) {
      setSpeechProvider(audioCaptions.provider);
    } else {
      pluginLogger.warn('No audio captions provider found in app settings, using default', { logCode: 'live_transcription_no_caption_provider', extraInfo: { defaultProvider: DEFAULT_SPEECH_PROVIDER } });
    }

    const enabled = audioCaptions?.enabled ?? false;
    const available = audioCaptions?.language?.available ?? [];
    if (!enabled) {
      pluginLogger.warn('Plugin live-transcription will not work because audioCaptions is not enabled or has no available languages', { logCode: 'live_transcription_captions_disabled', extraInfo: { enabled, available } });
    }
    setCaptionEnabled(enabled);
    setEnabledLocales(available);
    pluginLogger.debug('Caption settings loaded from meetingClientSettings', { logCode: 'live_transcription_settings_loaded', extraInfo: { speechProvider: audioCaptions?.provider, enabled, available } });
    // Plugin specific settings
    const gpPlg = plugins?.find(
      (plugin: { name?: string; settings?: Settings }) => plugin.name === SETTINGS_NAME,
    );

    if (gpPlg?.settings && gpPlg.settings.debug !== undefined) {
      setDebug(gpPlg.settings.debug);
      if (typeof pluginLogger.level === 'function') {
        pluginLogger.level(gpPlg.settings.debug ? 'debug' : pluginLogger.level());
      }
    } else {
      pluginLogger.warn('No debug setting found in plugin settings', { logCode: 'live_transcription_no_debug_setting' });
    }

    if (gpPlg?.settings && gpPlg.settings.panelImageUrl) {
      setPanelImageUrl(gpPlg.settings.panelImageUrl);
    } else {
      pluginLogger.warn('No panel image URL found in plugin settings, using default one', { logCode: 'live_transcription_no_panel_image_url' });
    }
  }, []);

  useEffect(() => {
    if (liveTranscriptionDisabled) {
      pluginLogger.warn('Plugin live-transcription will not work because disabled-features contains liveTranscription', { logCode: 'live_transcription_feature_disabled' });
    }
  }, [liveTranscriptionDisabled]);

  const contextValue = useMemo(() => ({
    debug,
    panelImageUrl,
    speechProvider,
    captionEnabled,
    enabledLocales,
    liveTranscriptionDisabled,
  }), [
    debug, panelImageUrl, speechProvider, captionEnabled, enabledLocales, liveTranscriptionDisabled,
  ]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

function useDebug() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useDebug must be used within a SettingsProvider');
  }

  return context.debug;
}

function usePanelImageUrl() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('usePanelImageUrl must be used within a SettingsProvider');
  }

  return context.panelImageUrl;
}

function useSpeechProvider() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSpeechProvider must be used within a SettingsProvider');
  }

  return context.speechProvider;
}

function useCaptionEnabled() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useCaptionEnabled must be used within a SettingsProvider');
  }

  return context.captionEnabled;
}

function useEnabledLocales() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useEnabledLocales must be used within a SettingsProvider');
  }

  return context.enabledLocales;
}

function useLiveTranscriptionDisabled() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useLiveTranscriptionDisabled must be used within a SettingsProvider');
  }

  return context.liveTranscriptionDisabled;
}

export {
  SettingsProvider,
  useDebug,
  usePanelImageUrl,
  useSpeechProvider,
  useCaptionEnabled,
  useEnabledLocales,
  useLiveTranscriptionDisabled,
};
