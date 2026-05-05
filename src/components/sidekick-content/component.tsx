import {
  ReactNode, useEffect, useRef, useState,
} from 'react';
import * as React from 'react';
import { defineMessages } from 'react-intl';
import * as Styled from './styles';
import { CaptionGraphqlResult, LiveTranscriptionSidekickContentProps } from './types';
import { GET_CAPTIONS } from './queries';
import { FloatingCaptionsWindow, FloatingCaptionsFontSettings } from '../floating-captions/component';

const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Roboto Mono', value: 'Roboto Mono, monospace' },
  { label: 'Nunito', value: 'Nunito, sans-serif' },
];

const intlMessages = defineMessages({
  downloadButtonLabel: {
    id: 'sidekick.panel.downloadButton.label',
    description: 'Label for the download button',
    defaultMessage: 'Download',
  },
  scrollButtonLabel: {
    id: 'sidekick.panel.scrollButton.label',
    description: 'Label for the "Scroll to latest" button',
    defaultMessage: 'Scroll to latest',
  },
  avatarAlternativeText: {
    id: 'sidekick.panel.avatar.alternativeText',
    description: 'Alternative text for avatar image',
    defaultMessage: 'Avatar for user {0}',
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
    id: 'sidekick.panel.fontSettings.label',
    description: 'Label for the font settings toggle',
    defaultMessage: 'Caption Style',
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
});

const DEFAULT_FONT_SETTINGS: FloatingCaptionsFontSettings = {
  fontSize: 15,
  fontWeight: 'normal',
  fontColor: '#000000',
  showUserName: true,
  fontFamily: 'Inter, sans-serif',
  userNameColor: '#6366f1',
  userNameBold: true,
};

export function LiveTranscriptionSidekickContent(
  { pluginApi, captionLocale: locale, intl }: LiveTranscriptionSidekickContentProps,
): ReactNode {
  const { data: captions } = pluginApi.useCustomSubscription
    ? pluginApi.useCustomSubscription<CaptionGraphqlResult>(GET_CAPTIONS, {
      variables: {
        locale,
      },
    })
    : { data: null };

  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontSettings, setFontSettings] = useState<FloatingCaptionsFontSettings>(DEFAULT_FONT_SETTINGS);

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [captions]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const nearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    setIsAtBottom(nearBottom);
  };

  const downloadLiveTranscription = () => {
    if (!captions?.caption_history) return;

    const formatDate = (isoDate: string) => {
      const date = new Date(isoDate);
      return date;
    };

    const textContent = captions.caption_history.map((c) => {
      const timestamp = formatDate(c.createdAt);
      return `${c.user.name} (${timestamp}): ${c.captionText}`;
    }).join('\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'captions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const floatingCaptionEntries = (captions?.caption_history ?? []).map((c) => ({
    captionId: c.captionId,
    captionText: c.captionText,
    userName: c.user.name,
    userColor: c.user.color,
    userAvatar: c.user.avatar,
  }));

  const captionsLength = captions?.caption_history ? captions?.caption_history.length : 0;

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
      <Styled.Header>
        <Styled.HeaderTitle>{locale}</Styled.HeaderTitle>
        <Styled.DownloadButton type="button" onClick={downloadLiveTranscription}>
          {intl.formatMessage(intlMessages.downloadButtonLabel)}
        </Styled.DownloadButton>
        <Styled.FloatButton
          type="button"
          active={floatingOpen}
          onClick={() => setFloatingOpen((prev) => !prev)}
        >
          {floatingOpen
            ? intl.formatMessage(intlMessages.floatButtonClose)
            : intl.formatMessage(intlMessages.floatButtonOpen)}
        </Styled.FloatButton>
        <Styled.SettingsToggleButton
          type="button"
          active={settingsOpen}
          onClick={() => setSettingsOpen((prev) => !prev)}
          title={intl.formatMessage(intlMessages.fontSettingsLabel)}
        >
          ⚙
        </Styled.SettingsToggleButton>
      </Styled.Header>

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
          {captions?.caption_history?.map((c, index) => (
            <Styled.CaptionRow
              hasMarginBottom={index !== captionsLength - 1}
              key={c.captionId}
            >
              <Styled.UserHeader>
                <Styled.UserInfo>
                  {c.user.avatar && c.user.avatar !== '' ? (
                    <Styled.UserAvatarImage
                      alt={intl.formatMessage(
                        intlMessages.avatarAlternativeText,
                        {
                          0: c.user.name,
                        },
                      )}
                      src={c.user.avatar}
                    />
                  ) : (
                    <Styled.UserAvatarInitials background={c.user?.color}>
                      {c.user.name.slice(0, 2)}
                    </Styled.UserAvatarInitials>
                  )}
                  <Styled.UserName>{c.user.name}</Styled.UserName>
                </Styled.UserInfo>

                <Styled.Timestamp>
                  {new Date(c.createdAt).toLocaleTimeString()}
                </Styled.Timestamp>
              </Styled.UserHeader>

              <Styled.CaptionContent>
                <Styled.CaptionText>{c.captionText}</Styled.CaptionText>
              </Styled.CaptionContent>
            </Styled.CaptionRow>
          ))}
        </Styled.ScrollArea>
      </Styled.ScrollAreaWrapper>

      {!isAtBottom && (
        <Styled.ScrollButton type="button" onClick={scrollToBottom}>
          {intl.formatMessage(intlMessages.scrollButtonLabel)}
        </Styled.ScrollButton>
      )}
    </Styled.Container>
  );
}
