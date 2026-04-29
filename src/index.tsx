import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { BbbPluginSdk, pluginLogger, PluginApi } from 'bigbluebutton-html-plugin-sdk';
import { LiveTranscriptionPlugin } from './components/app/component';

export const DEBUG = false;
pluginLogger.level(DEBUG ? 'debug' : pluginLogger.level());

const uuid = document.currentScript?.getAttribute('uuid') || 'root';
const pluginRoot = document.getElementById(uuid);

if (!pluginRoot) {
  pluginLogger.error(`Plugin root element not found for uuid: ${uuid}`);
}

function PluginInitializer({ pluginUuid }:
  { pluginUuid: string }): React.ReactNode {
  BbbPluginSdk.initialize(pluginUuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(pluginUuid);
  if (!pluginApi) {
    pluginLogger.error(`Plugin API not found for uuid: ${pluginUuid}`);
    return null;
  }

  return (
    <LiveTranscriptionPlugin
      pluginApi={pluginApi}
      uuid={pluginUuid}
    />
  );
}

const root = ReactDOM.createRoot(pluginRoot!);
root.render(
  <React.StrictMode>
    <PluginInitializer pluginUuid={uuid} />
  </React.StrictMode>,
);
