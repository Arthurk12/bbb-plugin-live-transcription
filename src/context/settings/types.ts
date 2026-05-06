import { MeetingClientSettings } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/api/types';
import { PluginApi } from 'bigbluebutton-html-plugin-sdk';

export interface Settings {
  panelImageUrl?: string,
  debug?: boolean,
}

export interface ClientSettings extends MeetingClientSettings {
  public: MeetingClientSettings['public'] & {
    app?: {
      audioCaptions?: {
        provider?: string;
        enabled?: boolean;
        language?: {
          available?: string[];
        };
      }
    };
    plugins?: [{ name?: string, settings?: Settings }];
  }
}

export type SettingsContextType = {
  debug?: boolean;
  panelImageUrl?: string;
  speechProvider: string;
  captionEnabled: boolean;
  enabledLocales: string[];
  liveTranscriptionDisabled: boolean;
};

export interface MeetingDisabledFeaturesResponse {
  meeting: {
    disabledFeatures: string[];
  }[];
}

export interface SettingsProviderProps {
  children: React.ReactNode;
  pluginApi: PluginApi;
}
