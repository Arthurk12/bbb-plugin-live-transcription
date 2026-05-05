import styled from 'styled-components';
import {
  colorHoverDark,
  colorPrimary,
  colorWhite,
  colorNeutral4,
  space2,
  space4,
  space6,
  fontSizeSmMd,
  colorTextDefault,
} from '../../styles-contants';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const ScrollAreaSpacer = styled.div`
  flex: 1;
`;

export const ScrollArea = styled.div`
  overflow-y: auto;
  height: 100%;
  background-color: ${colorWhite};
  display: flex;
  flex-direction: column-reverse;
  gap: ${space4};
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

export const ScrollButton = styled.button`
  position: absolute;
  left: 50%;
  bottom: 1rem;
  transform: translateX(-50%);
  background-color: ${colorPrimary};
  color: white;
  width: 80%;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 0;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${colorHoverDark};
  }
`;

export const HeaderToolbar = styled.div`
  padding: ${space2} ${space6};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px solid ${colorNeutral4};
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
`;

export const SettingsPanel = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  background-color: #f3f4f6;
  border-bottom: 1px solid #ccc;
`;

export const SettingsPanelTitle = styled.span`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.06em;
`;

export const SettingsDivider = styled.hr`
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 2px 0;
`;

export const SettingsRow = styled.div`
  display: flex;
  align-items: center;
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
`;

export const SettingsRangeValue = styled.span`
  font-size: 12px;
  color: #6b7280;
  width: 40px;
`;

export const FontFamilyOptions = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

export const FontFamilyButton = styled.button<{ active?: boolean; fontFamily: string }>`
  padding: 4px 10px;
  font-size: 13px;
  font-family: ${({ fontFamily }) => fontFamily};
  background-color: ${({ active }) => (active ? '#6366f1' : '#e5e7eb')};
  color: ${({ active }) => (active ? '#fff' : '#374151')};
  border: 2px solid ${({ active }) => (active ? '#6366f1' : 'transparent')};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ active }) => (active ? '#4f46e5' : '#d1d5db')};
  }
`;

export const OutlineStyleButton = styled.button<{ active?: boolean }>`
  padding: 4px 10px;
  font-size: 13px;
  background-color: ${({ active }) => (active ? '#6366f1' : '#e5e7eb')};
  color: ${({ active }) => (active ? '#fff' : '#374151')};
  border: 2px solid ${({ active }) => (active ? '#6366f1' : 'transparent')};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${({ active }) => (active ? '#4f46e5' : '#d1d5db')};
  }
`;
