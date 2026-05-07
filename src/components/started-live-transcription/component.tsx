import * as React from 'react';
import {
  ReactNode, useEffect, useLayoutEffect, useRef, useState, useCallback,
} from 'react';
import { IntlShape, defineMessages } from 'react-intl';
import {
  History as MDHistoryIcon,
  ContentCopy as MDContentCopyIcon,
  OpenInNew as MDOpenInNewIcon,
  OpenInNewOff as MdOpenInNewOffIcon,
  Settings as MDSettingsIcon,
  MoreHoriz as MDMoreHorizIcon,
} from '@mui/icons-material';
import { BBBTypography, BBButton } from '@mconf/bbb-ui-components-react';
import { PluginApi } from 'bigbluebutton-html-plugin-sdk';
import * as Styled from './styles';
import { CaptionGraphqlResult } from '../types';
import { GET_CAPTIONS, GET_CAPTIONS_SINCE } from '../queries';
import { Username } from '../username/component';
import { EmptyState } from '../empty-state/component';
import { FloatingCaptionsWindow, FloatingCaptionsFontSettings, OutlineStyle } from '../floating-captions/component';
import { pluginLogger } from '../../index';

const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Roboto Mono', value: 'Roboto Mono, monospace' },
  { label: 'Nunito', value: 'Nunito, sans-serif' },
];

const OUTLINE_STYLE_OPTIONS: { label: string; value: OutlineStyle }[] = [
  { label: 'None', value: 'none' },
  { label: 'Outline', value: 'outline' },
  { label: 'Shadow', value: 'shadow' },
  { label: 'Glow', value: 'glow' },
];

const DEFAULT_FONT_SETTINGS: FloatingCaptionsFontSettings = {
  fontSize: 15,
  fontWeight: 'normal',
  fontColor: '#000000',
  showUserName: true,
  fontFamily: 'Inter, sans-serif',
  userNameColor: '#6366f1',
  userNameBold: true,
  outlineColor: '#000000',
  outlineStyle: 'none',
  outlineSize: 2,
};

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
  floatButtonOpen: {
    id: 'sidekick.panel.floatButton.open',
    description: 'Label for the floating captions button when window is closed',
    defaultMessage: 'Float',
  },
  floatButtonClose: {
    id: 'sidekick.panel.floatButton.close',
    description: 'Label for the floating captions button when window is open',
    defaultMessage: 'Close Float',
  },
  fontSettingsLabel: {
    id: 'sidekick.panel.fontSettings.tooltip',
    description: 'Label for the caption style settings button',
    defaultMessage: 'Settings',
  },
  fontSizeLabel: {
    id: 'sidekick.panel.fontSettings.size',
    description: 'Label for font size setting',
    defaultMessage: 'Size',
  },
  fontWeightLabel: {
    id: 'sidekick.panel.fontSettings.weight',
    description: 'Label for font weight setting',
    defaultMessage: 'Bold',
  },
  fontColorLabel: {
    id: 'sidekick.panel.fontSettings.color',
    description: 'Label for font color setting',
    defaultMessage: 'Color',
  },
  showUserNameLabel: {
    id: 'sidekick.panel.fontSettings.showUserName',
    description: 'Label for show/hide user name setting',
    defaultMessage: 'Show name',
  },
  fontFamilyLabel: {
    id: 'sidekick.panel.fontSettings.fontFamily',
    description: 'Label for font family setting',
    defaultMessage: 'Font',
  },
  userNameColorLabel: {
    id: 'sidekick.panel.fontSettings.userNameColor',
    description: 'Label for user name color setting',
    defaultMessage: 'Name color',
  },
  userNameBoldLabel: {
    id: 'sidekick.panel.fontSettings.userNameBold',
    description: 'Label for user name bold setting',
    defaultMessage: 'Name bold',
  },
  outlineColorLabel: {
    id: 'sidekick.panel.fontSettings.outlineColor',
    description: 'Label for text outline color setting',
    defaultMessage: 'Outline color',
  },
  outlineStyleLabel: {
    id: 'sidekick.panel.fontSettings.outlineStyle',
    description: 'Label for text outline style setting',
    defaultMessage: 'Outline',
  },
  outlineSizeLabel: {
    id: 'sidekick.panel.fontSettings.outlineSize',
    description: 'Label for text outline size setting',
    defaultMessage: 'Outline size',
  },
});

export function StartedLiveTranscription({
  pluginApi,
  locale,
  intl,
}: LiveTranscriptionPanelProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const captionsTextRef = useRef('');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const leftGroupRef = useRef<HTMLDivElement>(null);
  const rightGroupRef = useRef<HTMLDivElement>(null);
  const overflowMenuRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [loadSince, setLoadSince] = useState<Date | undefined>(undefined);
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const [fontSettings, setFontSettings] = useState<
    FloatingCaptionsFontSettings>(DEFAULT_FONT_SETTINGS);

  const {
    data: captions,
    loading: captionsLoading,
  } = pluginApi.useCustomSubscription!<CaptionGraphqlResult>(
    loadSince ? GET_CAPTIONS_SINCE : GET_CAPTIONS,
    {
      variables: {
        locale,
        ...(loadSince ? { since: loadSince.toISOString() } : {}),
      },
    },
  );

  useEffect(() => {
    pluginLogger.debug('Captions subscription update', {
      logCode: 'live_transcription_captions_update',
      extraInfo: {
        captions,
        locale,
        captionsLoading,
        loadSince,
      },
    });
  }, [captions, captionsLoading, locale, loadSince]);

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

  useLayoutEffect(() => {
    const toolbar = toolbarRef.current;
    const observer = new ResizeObserver(([entry]) => {
      const leftW = leftGroupRef.current?.offsetWidth ?? 0;
      const rightW = rightGroupRef.current?.offsetWidth ?? 0;
      setIsNarrow(entry.contentRect.width < leftW + rightW);
    });
    if (toolbar) {
      observer.observe(toolbar);
    }
    return () => {
      observer.disconnect();
    };
  }, [nothingToShow]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!overflowMenuOpen) return;
      if (overflowMenuRef.current && !overflowMenuRef.current.contains(e.target as Node)) {
        setOverflowMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [overflowMenuOpen]);

  pluginLogger.debug('Rendering captions panel', {
    logCode: 'live_transcription_render_captions',
    extraInfo: {
      locale,
      captionCount: captions?.caption_history?.length ?? 0,
      isAtBottom,
      nothingToShow,
    },
  });
  const floatingCaptionEntries = (captions?.caption_history ?? []).map((c) => ({
    captionId: c.captionId,
    captionText: c.captionText,
    userName: c.user.name,
    userColor: c.user.color,
    userAvatar: c.user.avatar,
  }));

  if (nothingToShow) {
    return <EmptyState intl={intl} />;
  }

  return (
    <Styled.Container>

      {floatingOpen && (
        <FloatingCaptionsWindow
          captions={floatingCaptionEntries}
          locale={locale}
          fontSettings={fontSettings}
          onClose={() => setFloatingOpen(false)}
        />
      )}
      <Styled.HeaderToolbar ref={toolbarRef}>
        <Styled.HeaderToolbarGroup ref={leftGroupRef}>
          <BBButton
            label={intl.formatMessage(intlMessages.clearButtonlabel)}
            iconStart={<MDHistoryIcon style={{ fontSize: '0.85rem' }} />}
            onClick={handleClearCaptions}
            size="sm"
            variant="tertiary"
          />
          <BBButton
            label={intl.formatMessage(intlMessages.copyButtonLabel)}
            iconStart={<MDContentCopyIcon style={{ fontSize: '0.85rem' }} />}
            size="sm"
            variant="tertiary"
            onClick={handleCopyCaptions}
          />
        </Styled.HeaderToolbarGroup>
        <Styled.HeaderToolbarGroup
          ref={rightGroupRef}
          aria-hidden={isNarrow || undefined}
          style={isNarrow ? {
            visibility: 'hidden', position: 'absolute', pointerEvents: 'none',
          } : undefined}
        >
          <BBButton
            label={intl.formatMessage(floatingOpen
              ? intlMessages.floatButtonClose : intlMessages.floatButtonOpen)}
            iconStart={floatingOpen
              ? <MdOpenInNewOffIcon style={{ fontSize: '0.85rem' }} />
              : <MDOpenInNewIcon style={{ fontSize: '0.85rem' }} />}
            size="sm"
            variant="tertiary"
            onClick={() => setFloatingOpen((prev) => !prev)}
          />
          <BBButton
            label={intl.formatMessage(intlMessages.fontSettingsLabel)}
            iconStart={<MDSettingsIcon style={{ fontSize: '0.85rem' }} />}
            size="sm"
            variant="tertiary"
            onClick={() => setSettingsOpen((prev) => !prev)}
          />
        </Styled.HeaderToolbarGroup>
        {isNarrow && (
          <Styled.OverflowMenuWrapper ref={overflowMenuRef}>
            <BBButton
              label=""
              iconStart={<MDMoreHorizIcon style={{ fontSize: '0.85rem' }} />}
              size="sm"
              variant="tertiary"
              onClick={() => setOverflowMenuOpen((prev) => !prev)}
            />
            {overflowMenuOpen && (
              <Styled.OverflowDropdown>
                <Styled.OverflowDropdownItem>
                  <BBButton
                    label={intl.formatMessage(floatingOpen
                      ? intlMessages.floatButtonClose : intlMessages.floatButtonOpen)}
                    iconStart={floatingOpen
                      ? <MdOpenInNewOffIcon style={{ fontSize: '0.85rem' }} />
                      : <MDOpenInNewIcon style={{ fontSize: '0.85rem' }} />}
                    size="sm"
                    variant="tertiary"
                    onClick={() => {
                      setFloatingOpen((prev) => !prev);
                      setOverflowMenuOpen(false);
                    }}
                  />
                </Styled.OverflowDropdownItem>
                <Styled.OverflowDropdownItem>
                  <BBButton
                    label={intl.formatMessage(intlMessages.fontSettingsLabel)}
                    iconStart={<MDSettingsIcon style={{ fontSize: '0.85rem' }} />}
                    size="sm"
                    variant="tertiary"
                    onClick={() => {
                      setSettingsOpen((prev) => !prev);
                      setOverflowMenuOpen(false);
                    }}
                  />
                </Styled.OverflowDropdownItem>
              </Styled.OverflowDropdown>
            )}
          </Styled.OverflowMenuWrapper>
        )}
      </Styled.HeaderToolbar>
      {settingsOpen && (
        <Styled.SettingsPanel>
          <Styled.SettingsPanelTitle>
            {intl.formatMessage(intlMessages.fontSettingsLabel)}
          </Styled.SettingsPanelTitle>

          <Styled.SettingsRow>
            <Styled.SettingsLabel>
              {intl.formatMessage(intlMessages.fontSizeLabel)}
            </Styled.SettingsLabel>
            <Styled.SettingsRangeWrapper>
              <input
                type="range"
                min={10}
                max={120}
                value={fontSettings.fontSize}
                onChange={(e) => setFontSettings((prev) => ({
                  ...prev,
                  fontSize: Number(e.target.value),
                }))}
              />
              <Styled.SettingsRangeValue>
                {fontSettings.fontSize}
                px
              </Styled.SettingsRangeValue>
            </Styled.SettingsRangeWrapper>
          </Styled.SettingsRow>

          <Styled.SettingsRow>
            <Styled.SettingsLabel>
              {intl.formatMessage(intlMessages.fontColorLabel)}
            </Styled.SettingsLabel>
            <input
              type="color"
              value={fontSettings.fontColor}
              onChange={(e) => setFontSettings((prev) => ({
                ...prev,
                fontColor: e.target.value,
              }))}
            />
          </Styled.SettingsRow>

          <Styled.SettingsRow>
            <Styled.SettingsLabel>
              {intl.formatMessage(intlMessages.fontWeightLabel)}
            </Styled.SettingsLabel>
            <input
              type="checkbox"
              checked={fontSettings.fontWeight === 'bold'}
              onChange={(e) => setFontSettings((prev) => ({
                ...prev,
                fontWeight: e.target.checked ? 'bold' : 'normal',
              }))}
            />
          </Styled.SettingsRow>

          <Styled.SettingsDivider />

          <Styled.SettingsRow>
            <Styled.SettingsLabel>
              {intl.formatMessage(intlMessages.outlineStyleLabel)}
            </Styled.SettingsLabel>
            <Styled.FontFamilyOptions>
              {OUTLINE_STYLE_OPTIONS.map((opt) => (
                <Styled.OutlineStyleButton
                  key={opt.value}
                  type="button"
                  active={fontSettings.outlineStyle === opt.value}
                  onClick={() => setFontSettings((prev) => ({
                    ...prev,
                    outlineStyle: opt.value,
                  }))}
                >
                  {opt.label}
                </Styled.OutlineStyleButton>
              ))}
            </Styled.FontFamilyOptions>
          </Styled.SettingsRow>

          {fontSettings.outlineStyle !== 'none' && (
            <>
              <Styled.SettingsRow>
                <Styled.SettingsLabel>
                  {intl.formatMessage(intlMessages.outlineColorLabel)}
                </Styled.SettingsLabel>
                <input
                  type="color"
                  value={fontSettings.outlineColor}
                  onChange={(e) => setFontSettings((prev) => ({
                    ...prev,
                    outlineColor: e.target.value,
                  }))}
                />
              </Styled.SettingsRow>

              <Styled.SettingsRow>
                <Styled.SettingsLabel>
                  {intl.formatMessage(intlMessages.outlineSizeLabel)}
                </Styled.SettingsLabel>
                <Styled.SettingsRangeWrapper>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={fontSettings.outlineSize}
                    onChange={(e) => setFontSettings((prev) => ({
                      ...prev,
                      outlineSize: Number(e.target.value),
                    }))}
                  />
                  <Styled.SettingsRangeValue>
                    {fontSettings.outlineSize}
                    px
                  </Styled.SettingsRangeValue>
                </Styled.SettingsRangeWrapper>
              </Styled.SettingsRow>
            </>
          )}

          <Styled.SettingsDivider />

          <Styled.SettingsRow>
            <Styled.SettingsLabel>
              {intl.formatMessage(intlMessages.showUserNameLabel)}
            </Styled.SettingsLabel>
            <input
              type="checkbox"
              checked={fontSettings.showUserName}
              onChange={(e) => setFontSettings((prev) => ({
                ...prev,
                showUserName: e.target.checked,
              }))}
            />
          </Styled.SettingsRow>

          {fontSettings.showUserName && (
            <>
              <Styled.SettingsRow>
                <Styled.SettingsLabel>
                  {intl.formatMessage(intlMessages.userNameColorLabel)}
                </Styled.SettingsLabel>
                <input
                  type="color"
                  value={fontSettings.userNameColor}
                  onChange={(e) => setFontSettings((prev) => ({
                    ...prev,
                    userNameColor: e.target.value,
                  }))}
                />
              </Styled.SettingsRow>

              <Styled.SettingsRow>
                <Styled.SettingsLabel>
                  {intl.formatMessage(intlMessages.userNameBoldLabel)}
                </Styled.SettingsLabel>
                <input
                  type="checkbox"
                  checked={fontSettings.userNameBold}
                  onChange={(e) => setFontSettings((prev) => ({
                    ...prev,
                    userNameBold: e.target.checked,
                  }))}
                />
              </Styled.SettingsRow>
            </>
          )}

          <Styled.SettingsDivider />

          <Styled.SettingsRow>
            <Styled.SettingsLabel>
              {intl.formatMessage(intlMessages.fontFamilyLabel)}
            </Styled.SettingsLabel>
            <Styled.FontFamilyOptions>
              {FONT_OPTIONS.map((font) => (
                <Styled.FontFamilyButton
                  key={font.value}
                  type="button"
                  fontFamily={font.value}
                  active={fontSettings.fontFamily === font.value}
                  onClick={() => setFontSettings((prev) => ({
                    ...prev,
                    fontFamily: font.value,
                  }))}
                >
                  {font.label}
                </Styled.FontFamilyButton>
              ))}
            </Styled.FontFamilyOptions>
          </Styled.SettingsRow>
        </Styled.SettingsPanel>
      )}
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
