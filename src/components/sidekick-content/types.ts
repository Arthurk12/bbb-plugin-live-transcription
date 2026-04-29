import { PluginApi } from 'bigbluebutton-html-plugin-sdk';
import { IntlShape } from 'react-intl';

export interface LiveTranscriptionSidekickContentProps {
  pluginApi: NonNullable<PluginApi>;
  initialLocale: string;
  intl: IntlShape;
}

export interface CaptionHistoryProps {
  pluginApi: NonNullable<PluginApi>;
  locale: string;
  intl: IntlShape;
}

export interface CaptionGraphqlResult {
  caption_history: {
    user: {
      avatar: string;
      color: string;
      name: string;
    }
    captionText: string;
    captionId: string;
    createdAt: string;
  }[];
}

export interface CaptionRowProps {
  hasMarginBottom: boolean;
}

export interface UserAvatarInitialsProps {
  background: string;
}
