import * as React from 'react';
import {
  ReactNode, useEffect, useLayoutEffect, useRef, useState, useCallback,
} from 'react';
import { IntlShape, defineMessages } from 'react-intl';
import { PluginApi, CaptionsLanguageEnum } from 'bigbluebutton-html-plugin-sdk';
import {
  History as MDHistoryIcon,
  ContentCopy as MDContentCopyIcon,
  OpenInNew as MDOpenInNewIcon,
  OpenInNewOff as MdOpenInNewOffIcon,
  Edit as MDEditIcon,
} from '@mui/icons-material';
import { MenuItem } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  BBBTypography, BBButton, BBBToggle, BBBAccordion, BBBSelect, BBBHint,
} from '@mconf/bbb-ui-components-react';
import * as Styled from './styles';
import { CaptionActiveLocaleGraphqlResponse, SetSpeechLocaleMutation, CaptionLocaleGraphqlResponse } from '../types';
import { GET_CAPTION_ACTIVE_LOCALES, GET_CURRENT_CAPTION_LOCALE, SET_SPEECH_LOCALE } from '../queries';

import {
  getLocaleName, isGladia, mostSimilarLanguage, isWebSpeech,
} from '../../service';
import { hasSpeechRecognitionSupport } from '../../hooks/service';
import {
  FloatingCaptionsWindow,
  FloatingCaptionsEntry,
  FloatingCaptionsFontSettings,
  FloatingCaptionsSplitSettings,
} from '../floating-captions/component';
import {
  DEFAULT_FONT_SETTINGS,
  DEFAULT_SPLIT_SETTINGS,
  FONT_OPTIONS,
  OUTLINE_STYLE_OPTIONS,
} from '../../constants';
import { pluginLogger } from '../../index';
import { useLiveTranscriptionStore } from '../../context';
import { useEnabledLocales, useSpeechProvider } from '../../context/settings/context';
import TranscriptionVisualizer from '../transcription-visualizer/component';

interface LiveTranscriptionPanelProps {
  pluginApi: NonNullable<PluginApi>;
  locale: string;
  intl: IntlShape;
}

const intlMessages = defineMessages({
  spokenLocaleSelectorLabel: {
    id: 'panel.content.localeSelector.spokenLabel',
    description: 'Label for the locale selector when translation is available (Gladia)',
    defaultMessage: 'Spoken language',
  },
  viewLocaleSelectorLabel: {
    id: 'sidekick.panel.viewLocaleSelector.label',
    description: 'Label for the view language selector in the started panel',
    defaultMessage: 'View language',
  },
  autoDetectLocale: {
    id: 'panel.content.localeSelector.autoDetect',
    description: 'Label for the auto-detect option in the locale selector',
    defaultMessage: 'Auto-detect',
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
  unsupportedHintLabel: {
    id: 'live_transcription.banner.unsupported',
    description: 'Hint message for users without Web Speech API support',
    defaultMessage: 'Web Speech API not supported in your browser. Your voice will not be transcribed.',
  },
});

export function StartedLiveTranscription({
  pluginApi,
  locale,
  intl,
}: LiveTranscriptionPanelProps): ReactNode {
  const captionsTextRef = useRef('');
  const {
    loadSince, setLoadSince, currentLocale,
    viewLocale: persistedViewLocale, setViewLocale: setPersistedViewLocale,
    viewLocaleManuallySet, setViewLocaleManuallySet,
    spokenLocale: persistedSpokenLocale, setSpokenLocale: setPersistedSpokenLocale,
  } = useLiveTranscriptionStore((s) => s);
  const enabledLocales = useEnabledLocales();
  const provider = useSpeechProvider();
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [activeFloatingEntries, setActiveFloatingEntries] = useState<FloatingCaptionsEntry[]>([]);
  const [fontSettings, setFontSettings] = useState<
    FloatingCaptionsFontSettings>(DEFAULT_FONT_SETTINGS);
  const [splitSettings, setSplitSettings] = useState<
    FloatingCaptionsSplitSettings>(DEFAULT_SPLIT_SETTINGS);
  // Locale selections are mirrored into the (persistent) store so they survive
  // the panel being closed and reopened, which fully remounts this component.
  const [viewLocale, setViewLocaleState] = useState<string>(() => persistedViewLocale
    || (locale === 'auto' ? mostSimilarLanguage(currentLocale, enabledLocales) : locale));
  const [spokenLocale, setSpokenLocaleState] = useState<string>(() => persistedSpokenLocale
    || locale);
  const setViewLocale = useCallback((value: string) => {
    setViewLocaleState(value);
    setPersistedViewLocale(value);
  }, [setPersistedViewLocale]);
  const setSpokenLocale = useCallback((value: string) => {
    setSpokenLocaleState(value);
    setPersistedSpokenLocale(value);
  }, [setPersistedSpokenLocale]);
  // Workaround for a plugin SDK bug where changing a subscription's variables
  // breaks it: instead of reusing one TranscriptionVisualizer and swapping its
  // viewLocale, keep one mounted (but hidden) instance per locale ever
  // selected, each with a viewLocale that never changes after mount.
  const [seenViewLocales, setSeenViewLocales] = useState<string[]>(() => [viewLocale]);
  useEffect(() => {
    setSeenViewLocales((prev) => (prev.includes(viewLocale) ? prev : [...prev, viewLocale]));
  }, [viewLocale]);
  // Force a re-render after DOM commit so BBBAccordion re-measures its content
  // height when conditional rows (showUserName, outlineStyle) are toggled.
  const [, setAccordionTick] = useState(0);
  useLayoutEffect(() => {
    setAccordionTick((n) => n + 1);
  }, [fontSettings.showUserName, fontSettings.outlineStyle]);

  const [setSpeechLocale] = pluginApi.useCustomMutation!<
    SetSpeechLocaleMutation>(SET_SPEECH_LOCALE);

  const handleChangeSpokenLocale = useCallback((e: SelectChangeEvent<unknown>) => {
    const newLocale = e.target.value as string;
    setSpokenLocale(newLocale);
    // Only the initial "start" broadcasts the locale to everyone (see
    // LiveTranscriptionPanel.handleStartTranscription). Once transcription is
    // running, each user's spoken locale is their own setting and must stay
    // local, otherwise it forces a locale change (and a jarring panel
    // refresh) on every other participant.
    setSpeechLocale({ variables: { locale: newLocale, provider } });
    // 'auto' is only meaningful for the spoken (input) locale, not the view
    // (output) locale, so don't propagate it.
    if (!viewLocaleManuallySet && newLocale !== 'auto') {
      setViewLocale(newLocale);
    }
  }, [setSpeechLocale, provider, viewLocaleManuallySet, setSpokenLocale, setViewLocale]);

  // Tracks the value of the locale being viewed.
  const { data: currentCaptionLocaleData } = pluginApi.useCustomSubscription!<
    CaptionLocaleGraphqlResponse>(GET_CURRENT_CAPTION_LOCALE);

  const isViewCaptionsOverTheMediaEnabled = React.useMemo(() => {
    if (!currentCaptionLocaleData) return false;
    return currentCaptionLocaleData.user_current[0].captionLocale !== '';
  }, [currentCaptionLocaleData]);

  const currentCaptionLocale = currentCaptionLocaleData?.user_current[0]?.captionLocale ?? '';

  const setDisplayCaptionsLocale = useCallback((language: string) => {
    // Check whether the language string is equal to one of the values
    // in CaptionsLanguageEnum
    if (Object.values(CaptionsLanguageEnum).includes(language as CaptionsLanguageEnum)) {
      pluginApi.uiCommands?.captions.setDisplayAudioCaptions({
        displayAudioCaptions: language as CaptionsLanguageEnum,
      });
    } else {
      pluginLogger.warn('Attempted to set displayAudioCaptions with an invalid locale', { extraInfo: { locale: language } });
    }
  }, [pluginApi]);

  // Keep the displayed captions locale in sync with the selected view language.
  useEffect(() => {
    if (!isViewCaptionsOverTheMediaEnabled) return;
    if (currentCaptionLocale === viewLocale) return;
    setDisplayCaptionsLocale(viewLocale);
  }, [
    viewLocale, isViewCaptionsOverTheMediaEnabled, currentCaptionLocale, setDisplayCaptionsLocale,
  ]);

  const { data: captionActiveLocalesResult } = pluginApi.useCustomSubscription!<
    CaptionActiveLocaleGraphqlResponse>(GET_CAPTION_ACTIVE_LOCALES);

  const otherLocales = React.useMemo(() => {
    if (!captionActiveLocalesResult) return [];
    return captionActiveLocalesResult.caption_activeLocales
      .map((l) => l.locale)
      .filter((l) => l !== '' && l !== 'auto' && l !== locale)
      .sort((a, b) => getLocaleName(a).localeCompare(getLocaleName(b)));
  }, [captionActiveLocalesResult, locale]);

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
    pluginLogger.debug('Captions active locales update', {
      logCode: 'live_transcription_active_locales_update',
      extraInfo: { otherLocales, locale, viewLocale },
    });
  }, [otherLocales, locale, viewLocale]);

  const viewLocaleSelectorVisible = isGladia(provider) && otherLocales.length > 0;

  const showUnsupportedHint = isWebSpeech(provider) && !hasSpeechRecognitionSupport();
  const [unsupportedHintClosed, setUnsupportedHintClosed] = useState(false);

  return (
    <Styled.Container>
      {showUnsupportedHint && !unsupportedHintClosed && (
        <BBBHint
          label={intl.formatMessage(intlMessages.unsupportedHintLabel)}
          onRequestClose={() => setUnsupportedHintClosed(true)}
        />
      )}

      <Styled.HeaderToolbar>
        <Styled.LocaleSelectorRow>
          <BBBSelect
            id="spoken-locale-select"
            value={spokenLocale}
            title={intl.formatMessage(intlMessages.spokenLocaleSelectorLabel)}
            onChange={handleChangeSpokenLocale}
            fullWidth
          >
            {isGladia(provider)
              && (
              <MenuItem key="auto" value="auto">
                {intl.formatMessage(intlMessages.autoDetectLocale)}
              </MenuItem>
              )}
            {enabledLocales.map((l) => (
              <MenuItem key={l} value={l}>
                {getLocaleName(l)}
              </MenuItem>
            ))}
          </BBBSelect>
          {viewLocaleSelectorVisible && (
            <BBBSelect
              id="view-locale-select"
              value={viewLocale}
              title={intl.formatMessage(intlMessages.viewLocaleSelectorLabel)}
              onChange={(e) => {
                setViewLocale(e.target.value as string);
                setViewLocaleManuallySet(true);
                if (!isGladia(provider)) {
                  // When translation is not enabled, lock the spoken locale to
                  // the view locale to avoid confusion.
                  setSpokenLocale(e.target.value as string);
                }
              }}
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
        </Styled.LocaleSelectorRow>
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
            <BBBToggle
              helperText="Show captions"
              checked={isViewCaptionsOverTheMediaEnabled}
              onChange={(_, checked) => setDisplayCaptionsLocale(checked ? viewLocale : '')}
            />
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
      {floatingOpen && (
        <FloatingCaptionsWindow
          captions={activeFloatingEntries}
          locale={locale}
          fontSettings={fontSettings}
          splitSettings={splitSettings}
          onClose={() => setFloatingOpen(false)}
        />
      )}
      {seenViewLocales.map((loc) => (
        <Styled.LocalePanel key={loc} $active={loc === viewLocale}>
          <TranscriptionVisualizer
            pluginApi={pluginApi}
            viewLocale={loc}
            loadSince={loadSince}
            intl={intl}
            captionsTextRef={captionsTextRef}
            isActive={loc === viewLocale}
            onLiveCaptionsChange={setActiveFloatingEntries}
          />
        </Styled.LocalePanel>
      ))}
    </Styled.Container>
  );
}
