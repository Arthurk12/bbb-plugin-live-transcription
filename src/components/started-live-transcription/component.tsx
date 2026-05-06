import * as React from 'react';
import {
  ReactNode, useEffect, useRef, useState, useCallback,
} from 'react';
import { IntlShape, defineMessages } from 'react-intl';
import {
  History as MDHistoryIcon,
  ContentCopy as MDContentCopyIcon,
} from '@mui/icons-material';
import { BBBTypography, BBButton } from '@mconf/bbb-ui-components-react';
import { PluginApi, pluginLogger } from 'bigbluebutton-html-plugin-sdk';
import * as Styled from './styles';
import { CaptionGraphqlResult } from '../types';
import { GET_CAPTIONS, GET_CAPTIONS_SINCE } from '../queries';
import { Username } from '../username/component';
import { EmptyState } from '../empty-state/component';

interface LiveTranscriptionPanelProps {
  pluginApi: NonNullable<PluginApi>;
  locale: string;
  intl: IntlShape;
}

const intlMessages = defineMessages({
  scrollButtonLabel: {
    id: 'sidekick.panel.scrollButton.label',
    description: 'Label for the "Scroll to latest" button',
    defaultMessage: 'Scroll to latest',
  },
  clearButtonlabel: {
    id: 'sidekick.panel.clearButton.label',
    description: 'Label for the button that clears the caption history',
    defaultMessage: 'Clear',
  },
  copyButtonLabel: {
    id: 'sidekick.panel.copyButton.label',
    description: 'Label for the button that copies the caption history to clipboard',
    defaultMessage: 'Copy',
  },
});

export function StartedLiveTranscription({
  pluginApi,
  locale,
  intl,
}: LiveTranscriptionPanelProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const captionsTextRef = useRef('');
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [loadSince, setLoadSince] = useState<Date | undefined>(undefined);

  const { data: captions } = pluginApi.useCustomSubscription!<CaptionGraphqlResult>(
    loadSince ? GET_CAPTIONS_SINCE : GET_CAPTIONS,
    {
      variables: {
        locale,
        ...(loadSince ? { since: loadSince.toISOString() } : {}),
      },
    },
  );

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      // column-reverse: scrollTop = 0 is the bottom of the container
      container.scrollTop = 0;
    }
  }, []);

  const handleClearCaptions = useCallback(() => {
    const timestamp = new Date();
    pluginLogger.info('Clearing captions history', { logCode: 'live_transcription_clear_history', extraInfo: { locale, timestamp } });
    setLoadSince(timestamp);
  }, [locale]);

  const handleCopyCaptions = useCallback(() => {
    pluginLogger.debug('Copying captions to clipboard', { logCode: 'live_transcription_copy_captions', extraInfo: { charCount: captionsTextRef.current.length } });
    navigator.clipboard.writeText(captionsTextRef.current);
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [captions, locale, scrollToBottom]);

  useEffect(() => {
    const text = captions?.caption_history?.map(
      (c) => `${c.user.name} (${new Date(c.createdAt).toLocaleTimeString()}): ${c.captionText}`,
    ).join('\n') ?? '';
    captionsTextRef.current = text;
  }, [captions]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const nearBottom = container.scrollTop <= 50;
    setIsAtBottom(nearBottom);
  }, []);

  const nothingToShow = captions?.caption_history.length === 0;

  pluginLogger.debug('Rendering captions panel', {
    logCode: 'live_transcription_render_captions',
    extraInfo: {
      locale,
      captionCount: captions?.caption_history?.length ?? 0,
      isAtBottom,
      nothingToShow,
    },
  });

  if (nothingToShow) {
    return <EmptyState intl={intl} />;
  }

  return (
    <Styled.Container>
      <Styled.HeaderToolbar>
        <Styled.HeaderToolbarGroup>
          <BBButton
            label={intl.formatMessage(intlMessages.clearButtonlabel)}
            iconStart={<MDHistoryIcon style={{ fontSize: '0.85rem' }} />}
            onClick={handleClearCaptions}
            size="sm"
            variant="tertiary"
          />
        </Styled.HeaderToolbarGroup>
        <Styled.HeaderToolbarGroup>
          <BBButton
            label={intl.formatMessage(intlMessages.copyButtonLabel)}
            iconStart={<MDContentCopyIcon style={{ fontSize: '0.85rem' }} />}
            size="sm"
            variant="tertiary"
            onClick={handleCopyCaptions}
          />
        </Styled.HeaderToolbarGroup>
      </Styled.HeaderToolbar>
      <Styled.ScrollAreaWrapper>
        <Styled.ScrollArea ref={containerRef} onScroll={handleScroll}>
          <Styled.ScrollAreaSpacer />
          {captions?.caption_history?.map((c) => (
            <Styled.CaptionRow
              key={c.captionId}
            >
              <Styled.Timestamp>
                <BBBTypography variant="text2">
                  {intl.formatTime(c.createdAt)}
                </BBBTypography>
              </Styled.Timestamp>
              <Styled.CaptionContent>
                <Username
                  intl={intl}
                  user={c.user}
                />
                <BBBTypography>{c.captionText}</BBBTypography>
              </Styled.CaptionContent>
            </Styled.CaptionRow>
          ))}
        </Styled.ScrollArea>

        {!isAtBottom && (
          <Styled.ScrollButton type="button" onClick={scrollToBottom}>
            {intl.formatMessage(intlMessages.scrollButtonLabel)}
          </Styled.ScrollButton>
        )}
      </Styled.ScrollAreaWrapper>
    </Styled.Container>
  );
}
