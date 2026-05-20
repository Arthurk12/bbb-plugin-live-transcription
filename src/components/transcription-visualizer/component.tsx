import * as React from 'react';
import {
  ReactNode, useCallback, useEffect, useRef, useState,
} from 'react';
import { IntlShape, defineMessages } from 'react-intl';
import { PluginApi } from 'bigbluebutton-html-plugin-sdk';
import {
  BBBTypography, BBButton,
} from '@mconf/bbb-ui-components-react';
import { CaptionGraphqlResult } from '../types';
import { GET_CAPTIONS_SINCE } from '../queries';
import { Username } from '../username/component';
import { EmptyState } from '../empty-state/component';
import {
  FloatingCaptionsWindow,
  FloatingCaptionsFontSettings,
  FloatingCaptionsSplitSettings,
} from '../floating-captions/component';
import { pluginLogger } from '../../index';
import * as Styled from '../started-live-transcription/styles';

const intlMessages = defineMessages({
  scrollButtonLabel: {
    id: 'sidekick.panel.scrollButton.label',
    description: 'Label for the "Scroll to latest" button',
    defaultMessage: 'Scroll to latest',
  },
});

interface TranscriptionVisualizerProps {
  pluginApi: NonNullable<PluginApi>;
  locale: string;
  viewLocale: string;
  loadSince: string;
  intl: IntlShape;
  captionsTextRef: React.MutableRefObject<string>;
  floatingOpen: boolean;
  fontSettings: FloatingCaptionsFontSettings;
  splitSettings: FloatingCaptionsSplitSettings;
  onFloatingClose: () => void;
}

export function TranscriptionVisualizer({
  pluginApi,
  locale,
  viewLocale,
  loadSince,
  intl,
  captionsTextRef,
  floatingOpen,
  fontSettings,
  splitSettings,
  onFloatingClose,
}: TranscriptionVisualizerProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const {
    data: captions,
    loading: captionsLoading,
  } = pluginApi.useCustomSubscription!<CaptionGraphqlResult>(
    GET_CAPTIONS_SINCE,
    {
      variables: {
        locale: viewLocale,
        since: loadSince,
      },
    },
  );

  useEffect(() => {
    pluginLogger.debug('Captions subscription update', {
      logCode: 'live_transcription_captions_update',
      extraInfo: {
        captions,
        locale: viewLocale,
        captionsLoading,
        loadSince,
      },
    });
  }, [captions, captionsLoading, viewLocale, loadSince]);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      // column-reverse: scrollTop = 0 is the bottom of the container
      container.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [captions, viewLocale, scrollToBottom, isAtBottom]);

  useEffect(() => {
    // eslint-disable-next-line no-param-reassign
    captionsTextRef.current = captions?.caption_history?.map(
      (c) => `${c.user.name} (${new Date(c.createdAt).toLocaleTimeString()}): ${c.captionText}`,
    ).join('\n') ?? '';
  }, [captions, captionsTextRef]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    setIsAtBottom(container.scrollTop >= -50);
  }, []);

  const floatingCaptionEntries = (captions?.caption_history ?? []).map((c) => ({
    captionId: c.captionId,
    captionText: c.captionText,
    userName: c.user.name,
    userColor: c.user.color,
    userAvatar: c.user.avatar,
  }));

  const nothingToShow = (captions?.caption_history?.length ?? 0) === 0;

  return (
    <>
      {floatingOpen && (
        <FloatingCaptionsWindow
          captions={floatingCaptionEntries}
          locale={locale}
          fontSettings={fontSettings}
          splitSettings={splitSettings}
          onClose={onFloatingClose}
        />
      )}
      <Styled.SettingsDivider />
      <Styled.ScrollAreaWrapper>
        {nothingToShow ? (
          <EmptyState intl={intl} />
        ) : (
          <>
            <Styled.ScrollArea ref={containerRef} onScroll={handleScroll}>
              <Styled.ScrollAreaSpacer />
              {captions?.caption_history?.map((c) => (
                <Styled.CaptionRow key={c.captionId}>
                  <Styled.Timestamp>
                    <BBBTypography variant="text2">
                      {intl.formatTime(c.createdAt)}
                    </BBBTypography>
                  </Styled.Timestamp>
                  <Styled.CaptionContent>
                    <Username intl={intl} user={c.user} />
                    <BBBTypography>{c.captionText}</BBBTypography>
                  </Styled.CaptionContent>
                </Styled.CaptionRow>
              ))}
            </Styled.ScrollArea>
            {!isAtBottom && (
              <Styled.ScrollButton>
                <BBButton
                  label={intl.formatMessage(intlMessages.scrollButtonLabel)}
                  variant="primary"
                  size="sm"
                  onClick={scrollToBottom}
                />
              </Styled.ScrollButton>
            )}
          </>
        )}
      </Styled.ScrollAreaWrapper>
    </>
  );
}
