import styled from 'styled-components';
import {
  colorWhite,
  colorNeutral4,
  space2,
  space4,
  space6,
  fontSizeSmMd,
  colorTextDefault,
  colorPrimary,
} from '../../styles-contants';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const ScrollAreaSpacer = styled.div`
  flex: 1;
`;

export const ScrollArea = styled.div`
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column-reverse;
  gap: ${space4};
  background: linear-gradient(${colorWhite} 30%, rgba(255,255,255,0)),
    linear-gradient(rgba(255,255,255,0), ${colorWhite} 70%) 0 100%,
    /* Shadows */
    radial-gradient(farthest-side at 50% 0, rgba(0,0,0,.2), rgba(0,0,0,0)),
    radial-gradient(farthest-side at 50% 100%, rgba(0,0,0,.2), rgba(0,0,0,0)) 0 100%;

  background-repeat: no-repeat;
  background-color: transparent;
  background-size: 100% 40px, 100% 40px, 100% 14px, 100% 14px;
  background-attachment: local, local, scroll, scroll;

  // Fancy scroll
  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  &::-webkit-scrollbar-button {
    width: 0;
    height: 0;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,.25);
    border: none;
    border-radius: 50px;
  }
  &::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,.5); }
  &::-webkit-scrollbar-thumb:active { background: rgba(0,0,0,.25); }
  &::-webkit-scrollbar-track {
    background: rgba(0,0,0,.25);
    border: none;
    border-radius: 50px;
  }
  &::-webkit-scrollbar-track:hover { background: rgba(0,0,0,.25); }
  &::-webkit-scrollbar-track:active { background: rgba(0,0,0,.25); }
  &::-webkit-scrollbar-corner { background: 0 0; }
`;

export const CaptionRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${space2};
`;

export const CaptionContent = styled.div`
`;

export const Timestamp = styled.span`
  font-size: ${fontSizeSmMd};
  color: ${colorTextDefault};
  align-self: flex-start;
  flex-shrink: 0;
`;

export const ScrollButton = styled.div`
  position: absolute;
  left: 50%;
  bottom: 1rem;
  transform: translateX(-50%);
  width: 80%;
  display: flex;
  justify-content: center;
`;

export const HeaderToolbar = styled.div`
  padding: ${space2} ${space6};
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid ${colorNeutral4};
  gap: ${space2};
  overflow: visible;
`;

export const HeaderToolbarRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: ${space2};
`;

export const HeaderToolbarGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${space4};
`;

export const ScrollAreaWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  margin: ${space6};
  display: flex;
  flex-direction: column;
`;

export const LocalePanel = styled.div<{ $active: boolean }>`
  display: ${({ $active }) => ($active ? 'flex' : 'none')};
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

export const SettingsPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0 .6rem 0;
  padding-bottom: .5rem;
  max-height: 55vh;
  overflow-y: auto;
`;

export const SettingsSectionHeader = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #9ca3af;
  padding-top: 0.5rem;
  border-top: 1px solid #f3f4f6;
  margin-top: 0.25rem;

  &:first-child {
    padding-top: 0;
    border-top: none;
    margin-top: 0;
  }
`;

export const SettingsDivider = styled.hr`
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 2px 0;
`;

export const SettingsRow = styled.div`
  display: flex;
  align-items: center;
  margin-inline-start: 1rem;
  gap: 10px;
`;

export const SettingsLabel = styled.label`
  font-size: 13px;
  color: #374151;
  width: 80px;
  flex-shrink: 0;
`;

export const SettingsRangeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;

  input[type='range'] {
    flex-grow: 0.5;
  }
`;

export const FontFamilyOptions = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

export const ButtonHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  color: ${colorPrimary};
`;

export const LocaleSelectorRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${space2};

  & > * {
    flex: 1;
    min-width: 0;
  }
`;

export const ButtonHeaderSpacer = styled.div`
  flex: 1;
`;
