import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { BbbPluginSdk, pluginLogger, PluginApi } from 'bigbluebutton-html-plugin-sdk';
import { LiveTranscriptionPlugin } from './components/live-transcription-plugin/component';
import { SettingsProvider } from './context/settings/context';

export const LIVE_TRANSCRIPTION_DATA_CHANNEL_NAME = 'LIVE_TRANSCRIPTION_CHANNEL';

const uuid = document.currentScript?.getAttribute('uuid') || 'root';
const pluginRoot = document.getElementById(uuid);

if (!pluginRoot) {
  pluginLogger.error('Plugin root element not found', { logCode: 'live_transcription_root_not_found', extraInfo: { uuid } });
}

function PluginInitializer({ pluginUuid }:
  { pluginUuid: string }): React.ReactNode {
  BbbPluginSdk.initialize(pluginUuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(pluginUuid);
  if (!pluginApi) {
    pluginLogger.error('Plugin API not found', { logCode: 'live_transcription_api_not_found', extraInfo: { pluginUuid } });
    return null;
  }

  return (
    <SettingsProvider pluginApi={pluginApi}>
      <LiveTranscriptionPlugin
        pluginApi={pluginApi}
        uuid={pluginUuid}
      />
    </SettingsProvider>
  );
}

const root = ReactDOM.createRoot(pluginRoot!);
root.render(
  <React.StrictMode>
    <PluginInitializer pluginUuid={uuid} />
  </React.StrictMode>,
);
