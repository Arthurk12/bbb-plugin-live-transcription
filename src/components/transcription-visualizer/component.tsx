import * as React from 'react';
import {
  ReactNode, useCallback, useEffect, useMemo, useRef, useState, memo,
} from 'react';
import { IntlShape, defineMessages } from 'react-intl';
import { PluginApi } from 'bigbluebutton-html-plugin-sdk';
import {
  BBBTypography, BBButton,
} from '@mconf/bbb-ui-components-react';
import { CaptionGraphqlResult, LiveCaptionGraphqlResult } from '../types';
import { GET_CAPTIONS_SINCE, GET_LIVE_CAPTIONS } from '../queries';
import { Username } from '../username/component';
import { EmptyState } from '../empty-state/component';
import { FloatingCaptionsEntry } from '../floating-captions/component';
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
  viewLocale: string;
  loadSince: string;
  intl: IntlShape;
  captionsTextRef: React.MutableRefObject<string>;
  isActive: boolean;
  onLiveCaptionsChange: (entries: FloatingCaptionsEntry[]) => void;
}

function TranscriptionVisualizer({
  pluginApi,
  viewLocale,
  loadSince,
  intl,
  captionsTextRef,
  isActive,
  onLiveCaptionsChange,
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

  // Backs the floating captions window only: this returns just the recent,
  // non-expired captions, so it naturally vanishes after a period of silence.
  const { data: liveCaptions } = pluginApi.useCustomSubscription!<LiveCaptionGraphqlResult>(
    GET_LIVE_CAPTIONS,
    {
      variables: {
        locale: viewLocale,
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
    if (!isActive) return;
    // eslint-disable-next-line no-param-reassign
    captionsTextRef.current = captions?.caption_history?.map(
      (c) => `${c.user.name} (${new Date(c.createdAt).toLocaleTimeString()}): ${c.captionText}`,
    ).join('\n') ?? '';
  }, [captions, captionsTextRef, isActive]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    setIsAtBottom(container.scrollTop >= -50);
  }, []);

  const floatingCaptionEntries = useMemo(() => (liveCaptions?.caption ?? []).map((c) => ({
    captionId: c.captionId,
    captionText: c.captionText,
    userName: c.user.name,
    userColor: c.user.color,
    userAvatar: c.user.avatar,
  })), [liveCaptions]);

  useEffect(() => {
    if (!isActive) return;
    onLiveCaptionsChange(floatingCaptionEntries);
  }, [floatingCaptionEntries, isActive, onLiveCaptionsChange]);

  const nothingToShow = (captions?.caption_history?.length ?? 0) === 0;

  return (
    <>
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

export default memo(TranscriptionVisualizer);
