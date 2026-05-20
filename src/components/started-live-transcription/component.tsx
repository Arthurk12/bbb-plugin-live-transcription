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
  Edit as MDEditIcon,
} from '@mui/icons-material';
import { MenuItem } from '@mui/material';
import {
  BBBTypography, BBButton, BBBToggle, BBBAccordion, BBBSelect,
} from '@mconf/bbb-ui-components-react';
import { PluginApi } from 'bigbluebutton-html-plugin-sdk';
import * as Styled from './styles';
import { CaptionActiveLocaleGraphqlResponse, CaptionGraphqlResult } from '../types';
import { GET_CAPTION_ACTIVE_LOCALES, GET_CAPTIONS_SINCE } from '../queries';
import { Username } from '../username/component';
import { EmptyState } from '../empty-state/component';
import { getLocaleName, isGladia, mostSimilarLanguage } from '../../service';
import {
  FloatingCaptionsWindow,
  FloatingCaptionsFontSettings,
  FloatingCaptionsSplitSettings,
  OutlineStyle,
} from '../floating-captions/component';
import { pluginLogger } from '../../index';
import { useLiveTranscriptionStore } from '../../context';
import { useEnabledLocales, useSpeechProvider } from '../../context/settings/context';

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
  backgroundColor: '#ffffff',
};

const DEFAULT_SPLIT_SETTINGS: FloatingCaptionsSplitSettings = {
  lineLimit: 60,
  linesPerMessage: 2,
};

interface LiveTranscriptionPanelProps {
  pluginApi: NonNullable<PluginApi>;
  locale: string;
  intl: IntlShape;
}

const intlMessages = defineMessages({
  viewLocaleSelectorLabel: {
    id: 'sidekick.panel.viewLocaleSelector.label',
    description: 'Label for the view language selector in the started panel',
    defaultMessage: 'View language',
  },
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
  settingsLabel: {
    id: 'sidekick.panel.settings.label',
    description: 'Label for the caption style settings button',
    defaultMessage: 'Configurações da janela destacada',
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
    defaultMessage: 'Show',
  },
  fontFamilyLabel: {
    id: 'sidekick.panel.fontSettings.fontFamily',
    description: 'Label for font family setting',
    defaultMessage: 'Family',
  },
  userNameColorLabel: {
    id: 'sidekick.panel.fontSettings.userNameColor',
    description: 'Label for user name color setting',
    defaultMessage: 'Color',
  },
  userNameBoldLabel: {
    id: 'sidekick.panel.fontSettings.userNameBold',
    description: 'Label for user name bold setting',
    defaultMessage: 'Name bold',
  },
  outlineColorLabel: {
    id: 'sidekick.panel.fontSettings.outlineColor',
    description: 'Label for text outline color setting',
    defaultMessage: 'Color',
  },
  outlineStyleLabel: {
    id: 'sidekick.panel.fontSettings.outlineStyle',
    description: 'Label for text outline style setting',
    defaultMessage: 'Type',
  },
  outlineSizeLabel: {
    id: 'sidekick.panel.fontSettings.outlineSize',
    description: 'Label for text outline size setting',
    defaultMessage: 'Size',
  },
  lineLimitLabel: {
    id: 'sidekick.panel.fontSettings.lineLimit',
    description: 'Label for characters per line setting',
    defaultMessage: 'Chars per line',
  },
  linesPerMessageLabel: {
    id: 'sidekick.panel.fontSettings.linesPerMessage',
    description: 'Label for lines per caption setting',
    defaultMessage: 'Lines per caption',
  },
  fontSettingsTooltipLabel: {
    id: 'sidekick.panel.fontSettings.tooltip',
    description: 'Tooltip explaining settings apply only to the floating captions window',
    defaultMessage: 'These settings apply only to the floating captions window',
  },
  backgroundColorLabel: {
    id: 'sidekick.panel.fontSettings.backgroundColor',
    description: 'Label for background color setting of the floating captions window',
    defaultMessage: 'Color',
  },
  sectionFontLabel: {
    id: 'sidekick.panel.fontSettings.section.font',
    description: 'Section header for font settings',
    defaultMessage: 'Font',
  },
  sectionOutlineLabel: {
    id: 'sidekick.panel.fontSettings.section.outline',
    description: 'Section header for outline settings',
    defaultMessage: 'Outline',
  },
  sectionBackgroundLabel: {
    id: 'sidekick.panel.fontSettings.section.background',
    description: 'Section header for background settings',
    defaultMessage: 'Background',
  },
  sectionShowNameLabel: {
    id: 'sidekick.panel.fontSettings.section.showName',
    description: 'Section header for show name settings',
    defaultMessage: 'Name',
  },
  sectionLayoutLabel: {
    id: 'sidekick.panel.fontSettings.section.layout',
    description: 'Section header for layout settings',
    defaultMessage: 'Layout',
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
  const [isAtBottom, setIsAtBottom] = useState(true);
  const { loadSince, setLoadSince, currentLocale } = useLiveTranscriptionStore((s) => s);
  const enabledLocales = useEnabledLocales();
  const provider = useSpeechProvider();
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [fontSettings, setFontSettings] = useState<
    FloatingCaptionsFontSettings>(DEFAULT_FONT_SETTINGS);
  const [splitSettings, setSplitSettings] = useState<
    FloatingCaptionsSplitSettings>(DEFAULT_SPLIT_SETTINGS);
  const [viewLocale, setViewLocale] = useState<string>(locale === 'auto'
    ? mostSimilarLanguage(currentLocale, enabledLocales) : locale);
  // Force a re-render after DOM commit so BBBAccordion re-measures its content
  // height when conditional rows (showUserName, outlineStyle) are toggled.
  const [, setAccordionTick] = useState(0);
  useLayoutEffect(() => {
    setAccordionTick((n) => n + 1);
  }, [fontSettings.showUserName, fontSettings.outlineStyle]);

  const { data: captionActiveLocalesResult } = pluginApi.useCustomSubscription!<
    CaptionActiveLocaleGraphqlResponse>(GET_CAPTION_ACTIVE_LOCALES);

  const otherLocales = React.useMemo(() => {
    if (!captionActiveLocalesResult) return [];
    return captionActiveLocalesResult.caption_activeLocales
      .map((l) => l.locale)
      .filter((l) => l !== '' && l !== 'auto' && l !== viewLocale);
  }, [captionActiveLocalesResult, viewLocale]);

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

  const handleClearCaptions = useCallback(() => {
    const timestamp = new Date().toISOString();
    pluginLogger.info('Clearing captions history', { logCode: 'live_transcription_clear_history', extraInfo: { locale: viewLocale, timestamp } });
    setLoadSince(timestamp);
  }, [viewLocale, setLoadSince]);

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

  useEffect(() => {
    pluginLogger.debug('Captions active locales update', {
      logCode: 'live_transcription_active_locales_update',
      extraInfo: { otherLocales, locale, viewLocale },
    });
  }, [otherLocales, locale, viewLocale]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const nearBottom = container.scrollTop >= -50;
    setIsAtBottom(nearBottom);
  }, []);

  console.log('captions: ', captions);
  const nothingToShow = (captions?.caption_history.length ?? 0) === 0;

  pluginLogger.debug('Rendering captions panel', {
    logCode: 'live_transcription_render_captions',
    extraInfo: {
      locale: viewLocale,
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

  const viewLocaleSelectorVisible = otherLocales.length > 0;

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
          splitSettings={splitSettings}
          onClose={() => setFloatingOpen(false)}
        />
      )}
      <Styled.HeaderToolbar ref={toolbarRef}>
        {isGladia(provider) && viewLocaleSelectorVisible && (
          <BBBSelect
            id="view-locale-select"
            value={viewLocale}
            title={intl.formatMessage(intlMessages.viewLocaleSelectorLabel)}
            onChange={(e) => setViewLocale(e.target.value as string)}
            fullWidth
          >
            <MenuItem key={locale} value={locale}>
              {getLocaleName(locale)}
            </MenuItem>
            {otherLocales.map((l) => (
              <MenuItem key={l} value={l}>
                {getLocaleName(l)}
              </MenuItem>
            ))}
          </BBBSelect>
        )}
        <Styled.HeaderToolbarRow>
          <Styled.HeaderToolbarGroup>
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
          <Styled.HeaderToolbarGroup>
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
          </Styled.HeaderToolbarGroup>
        </Styled.HeaderToolbarRow>
      </Styled.HeaderToolbar>
      <BBBAccordion
        title={intl.formatMessage(intlMessages.settingsLabel)}
        tooltipLabel={intl.formatMessage(intlMessages.fontSettingsTooltipLabel)}
        buttonHeader={(
          <Styled.ButtonHeaderWrapper>
            <Styled.ButtonHeaderSpacer />
            <MDEditIcon style={{ fontSize: '0.85rem' }} />
          </Styled.ButtonHeaderWrapper>
        )}
      >
        <Styled.SettingsPanel>

          <Styled.SettingsSectionHeader>
            {intl.formatMessage(intlMessages.sectionFontLabel)}
          </Styled.SettingsSectionHeader>

          <Styled.SettingsRow>
            <Styled.SettingsLabel>
              {intl.formatMessage(intlMessages.fontFamilyLabel)}
            </Styled.SettingsLabel>
            <Styled.FontFamilyOptions>
              {FONT_OPTIONS.map((font) => (
                <BBButton
                  key={font.value}
                  label={font.label}
                  variant={fontSettings.fontFamily === font.value ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFontSettings((prev) => ({
                    ...prev,
                    fontFamily: font.value,
                  }))}
                />
              ))}
            </Styled.FontFamilyOptions>
          </Styled.SettingsRow>

          <Styled.SettingsRow>
            <Styled.SettingsLabel>
              {intl.formatMessage(intlMessages.fontWeightLabel)}
            </Styled.SettingsLabel>
            <BBBToggle
              checked={fontSettings.fontWeight === 'bold'}
              onChange={(_, checked) => setFontSettings((prev) => ({
                ...prev,
                fontWeight: checked ? 'bold' : 'normal',
              }))}
            />
          </Styled.SettingsRow>

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
              <BBBTypography variant="text2">
                {fontSettings.fontSize}
                px
              </BBBTypography>
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

          <Styled.SettingsSectionHeader>
            {intl.formatMessage(intlMessages.sectionOutlineLabel)}
          </Styled.SettingsSectionHeader>

          <Styled.SettingsRow>
            <Styled.SettingsLabel>
              {intl.formatMessage(intlMessages.outlineStyleLabel)}
            </Styled.SettingsLabel>
            <Styled.FontFamilyOptions>
              {OUTLINE_STYLE_OPTIONS.map((opt) => (
                <BBButton
                  key={opt.value}
                  label={opt.label}
                  variant={fontSettings.outlineStyle === opt.value ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFontSettings((prev) => ({
                    ...prev,
                    outlineStyle: opt.value,
                  }))}
                />
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
                  <BBBTypography variant="text2">
                    {fontSettings.outlineSize}
                    px
                  </BBBTypography>
                </Styled.SettingsRangeWrapper>
              </Styled.SettingsRow>
            </>
          )}

          <Styled.SettingsSectionHeader>
            {intl.formatMessage(intlMessages.sectionBackgroundLabel)}
          </Styled.SettingsSectionHeader>

          <Styled.SettingsRow>
            <Styled.SettingsLabel>
              {intl.formatMessage(intlMessages.backgroundColorLabel)}
            </Styled.SettingsLabel>
            <input
              type="color"
              value={fontSettings.backgroundColor}
              onChange={(e) => setFontSettings((prev) => ({
                ...prev,
                backgroundColor: e.target.value,
              }))}
            />
          </Styled.SettingsRow>

          <Styled.SettingsSectionHeader>
            {intl.formatMessage(intlMessages.sectionShowNameLabel)}
          </Styled.SettingsSectionHeader>

          <Styled.SettingsRow>
            <Styled.SettingsLabel>
              {intl.formatMessage(intlMessages.showUserNameLabel)}
            </Styled.SettingsLabel>
            <BBBToggle
              checked={fontSettings.showUserName}
              onChange={(_, checked) => setFontSettings((prev) => ({
                ...prev,
                showUserName: checked,
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
                <BBBToggle
                  checked={fontSettings.userNameBold}
                  onChange={(_, checked) => setFontSettings((prev) => ({
                    ...prev,
                    userNameBold: checked,
                  }))}
                />
              </Styled.SettingsRow>
            </>
          )}

          <Styled.SettingsSectionHeader>
            {intl.formatMessage(intlMessages.sectionLayoutLabel)}
          </Styled.SettingsSectionHeader>

          <Styled.SettingsRow>
            <Styled.SettingsLabel>
              {intl.formatMessage(intlMessages.lineLimitLabel)}
            </Styled.SettingsLabel>
            <Styled.SettingsRangeWrapper>
              <input
                type="range"
                min={20}
                max={200}
                value={splitSettings.lineLimit}
                onChange={(e) => setSplitSettings((prev) => ({
                  ...prev,
                  lineLimit: Number(e.target.value),
                }))}
              />
              <BBBTypography variant="text2">
                {splitSettings.lineLimit}
              </BBBTypography>
            </Styled.SettingsRangeWrapper>
          </Styled.SettingsRow>

          <Styled.SettingsRow>
            <Styled.SettingsLabel>
              {intl.formatMessage(intlMessages.linesPerMessageLabel)}
            </Styled.SettingsLabel>
            <Styled.SettingsRangeWrapper>
              <input
                type="range"
                min={1}
                max={10}
                value={splitSettings.linesPerMessage}
                onChange={(e) => setSplitSettings((prev) => ({
                  ...prev,
                  linesPerMessage: Number(e.target.value),
                }))}
              />
              <BBBTypography variant="text2">
                {splitSettings.linesPerMessage}
              </BBBTypography>
            </Styled.SettingsRangeWrapper>
          </Styled.SettingsRow>

        </Styled.SettingsPanel>
      </BBBAccordion>
      <Styled.SettingsDivider />
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
          <Styled.ScrollButton>
            <BBButton
              label={intl.formatMessage(intlMessages.scrollButtonLabel)}
              variant="primary"
              size="sm"
              onClick={scrollToBottom}
            />
          </Styled.ScrollButton>
        )}
      </Styled.ScrollAreaWrapper>
    </Styled.Container>
  );
}
