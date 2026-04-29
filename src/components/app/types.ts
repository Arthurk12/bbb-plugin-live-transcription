import { PluginApi } from 'bigbluebutton-html-plugin-sdk';

export interface LiveTranscriptionPluginProps {
  uuid: string;
  pluginApi: NonNullable<PluginApi>;
}

export interface CaptionActiveLocaleGraphqlResponse {
  caption_activeLocales: {
    locale: string;
  }[];
}

export interface CaptionSettingsGraphqlResponse {
  meeting: {
    disabledFeatures: string[];
    captionSettings: {
      audioCaptionEnabled: boolean;
      audioCaptionAvailableLanguages: string[];
    }
  }[]
}
