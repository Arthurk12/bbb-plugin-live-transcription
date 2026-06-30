import { useEffect, useRef } from 'react';
import { PluginApi, DataChannelTypes } from 'bigbluebutton-html-plugin-sdk';
import { WEBSPEECH_SUPPORT_DATA_CHANNEL_NAME, pluginLogger } from '../index';
import { hasSpeechRecognitionSupport } from './service';
import { useLiveTranscriptionStore } from '../context';
import { useSpeechProvider } from '../context/settings/context';
import { isWebSpeech } from '../service';

interface WebspeechSupportMessage {
  userId: string;
  hasSupport: boolean;
  userName: string;
}

export const useWebspeechSupportBroadcast = (pluginApi: PluginApi) => {
  const provider = useSpeechProvider();
  const { addOrUpdateWebspeechUserSupport } = useLiveTranscriptionStore();
  const broadcastedRef = useRef(false);

  const currentUser = pluginApi.useCurrentUser?.();
  const {
    data: currentUserData,
    loading: currentUserLoading,
  } = currentUser || {};

  const {
    data: dataChannelData,
    pushEntry,
  } = pluginApi.useDataChannel?.<WebspeechSupportMessage>(
    WEBSPEECH_SUPPORT_DATA_CHANNEL_NAME,
    DataChannelTypes.LATEST_ITEM,
  ) || { data: undefined };

  // Process incoming messages from other users
  useEffect(() => {
    if (!isWebSpeech(provider)) return;
    if (!dataChannelData?.data?.[0]) return;

    const payload = dataChannelData.data[0].payloadJson as WebspeechSupportMessage | undefined;
    if (!payload) return;

    const { userId, hasSupport, userName } = payload;
    pluginLogger.debug('Received webspeech support status from user', {
      logCode: 'live_transcription_webspeech_support_status_received',
      extraInfo: { userId, hasSupport, userName },
    });

    // Update store with user's support status
    if (!hasSupport) {
      addOrUpdateWebspeechUserSupport({
        userId,
        hasSupport,
        name: userName,
      });
    }
  }, [dataChannelData, provider, addOrUpdateWebspeechUserSupport]);

  // Broadcast current user's support status on plugin startup
  useEffect(() => {
    if (!isWebSpeech(provider)) return;
    if (currentUserLoading || !currentUserData) return;
    if (broadcastedRef.current) return;
    if (!pushEntry) return;

    const hasSupport = hasSpeechRecognitionSupport();

    const message: WebspeechSupportMessage = {
      userId: currentUserData.userId,
      hasSupport,
      userName: currentUserData.name || currentUserData.userId,
    };

    pluginLogger.debug('Broadcasting webspeech support status', {
      logCode: 'live_transcription_webspeech_support_broadcast',
      extraInfo: message,
    });

    pushEntry(message);

    broadcastedRef.current = true;
  }, [provider, currentUserLoading, currentUserData, pushEntry]);
};
