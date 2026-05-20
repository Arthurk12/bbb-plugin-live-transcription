import {
  FloatingCaptionsFontSettings,
  FloatingCaptionsSplitSettings,
  OutlineStyle,
} from './components/floating-captions/component';

export const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Roboto Mono', value: 'Roboto Mono, monospace' },
  { label: 'Nunito', value: 'Nunito, sans-serif' },
];

export const OUTLINE_STYLE_OPTIONS: { label: string; value: OutlineStyle }[] = [
  { label: 'None', value: 'none' },
  { label: 'Outline', value: 'outline' },
  { label: 'Shadow', value: 'shadow' },
  { label: 'Glow', value: 'glow' },
];

export const DEFAULT_FONT_SETTINGS: FloatingCaptionsFontSettings = {
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

export const DEFAULT_SPLIT_SETTINGS: FloatingCaptionsSplitSettings = {
  lineLimit: 60,
  linesPerMessage: 2,
};
