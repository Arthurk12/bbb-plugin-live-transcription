import { useEffect } from 'react';
import { PluginApi, DataChannelTypes } from 'bigbluebutton-html-plugin-sdk';
import { SET_SPEECH_LOCALE } from '../components/queries';
import { DataChannelResponse, SetSpeechLocaleMutation } from '../components/types';
import { LIVE_TRANSCRIPTION_DATA_CHANNEL_NAME, pluginLogger } from '../index';
import { useLiveTranscriptionStore } from '../context';
import { useSpeechProvider } from '../context/settings/context';
import { hasSpeechRecognitionSupport } from './service';
import { isWebSpeech } from '../service';

const useEnableTranscription = (pluginApi: PluginApi, isMod: boolean) => {
  const { setStarted, setActiveLocale } = useLiveTranscriptionStore();
  const [setSpeechLocale, result] = pluginApi.useCustomMutation!<
    SetSpeechLocaleMutation>(SET_SPEECH_LOCALE);
  const provider = useSpeechProvider();

  const {
    data: dataChannelLastItem,
  } = pluginApi.useDataChannel!<DataChannelResponse>(
    LIVE_TRANSCRIPTION_DATA_CHANNEL_NAME,
    DataChannelTypes.LATEST_ITEM,
  );
  const shouldEnableTranscription = Boolean(dataChannelLastItem
    && dataChannelLastItem.data?.[0]
    && dataChannelLastItem.data[0]?.payloadJson?.state === 'started'
    && dataChannelLastItem.data[0]?.payloadJson?.locale !== '');

  const newLocale = dataChannelLastItem?.data?.[0]?.payloadJson?.locale;

  useEffect(() => {
    pluginLogger.debug('Data channel latest item changed', { logCode: 'live_transcription_data_channel_latest_item_changed', extraInfo: { dataChannelLastItem } });
  }, [dataChannelLastItem]);

  useEffect(() => {
    pluginLogger.debug('setSpeechLocale mutation result changed', { logCode: 'live_transcription_set_speech_locale_result', extraInfo: { result } });
  }, [result]);

  useEffect(() => {
    if (!dataChannelLastItem || !dataChannelLastItem.data?.[0]) return;
    if (!setSpeechLocale) return;

    if (!newLocale) {
      pluginLogger.error('Received data channel entry without locale', { logCode: 'live_transcription_missing_locale', extraInfo: { dataChannelEntry: dataChannelLastItem.data?.[0] } });
      return;
    }
    setStarted(shouldEnableTranscription);
    setActiveLocale(newLocale as string);
    if (isWebSpeech(provider) && !hasSpeechRecognitionSupport()) {
      pluginLogger.error('Browser does not support Web Speech API but provider is set to webspeech', { logCode: 'live_transcription_webspeech_unsupported' });
      return;
    }
    pluginLogger.debug('Enabling speech transcription from data channel', { logCode: 'live_transcription_enabling', extraInfo: { locale: newLocale, provider } });
    setSpeechLocale({ variables: { locale: newLocale, provider } });
  }, [shouldEnableTranscription, setSpeechLocale, newLocale]);

  return isMod ? false : shouldEnableTranscription;
};

export default useEnableTranscription;
