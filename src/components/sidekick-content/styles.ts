import styled from 'styled-components';
import { CaptionRowProps, UserAvatarInitialsProps } from './types';

export const UserAvatarInitials = styled.div<UserAvatarInitialsProps>`
  background-color: ${({ background }) => background};
  height: 2rem;
  width: 2rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1rem;
  font-weight: 400;
  margin-bottom: .25rem;
  text-transform: capitalize;
`;

export const UserAvatarImage = styled.img`
  height: 2rem;
  width: 2rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  width: 100%;
  height: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const ScrollArea = styled.div`
  overflow-y: auto;
  height: 100%;
  padding: 1rem;
  background-color: white;
`;

export const CaptionRow = styled.div<CaptionRowProps>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  ${({ hasMarginBottom: hasBottomMargin = true }) => hasBottomMargin && `
    margin-bottom: 1rem;
  `}
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const UserName = styled.span`
  font-weight: 600;
  color: #1f2937;
`;

export const CaptionContent = styled.div`
  padding-left: 3rem;
`;

export const Timestamp = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-right: 0.5rem;
`;

export const CaptionText = styled.p`
  color: #374151;
  margin: 0.25rem 0 0;
`;

export const ScrollButton = styled.button`
  position: absolute;
  left: 50%;
  bottom: 1rem;
  transform: translateX(-50%);
  background-color: #0F70D7;
  color: white;
  width: 80%;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 0;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0C57A7;
  }
`;

export const Header = styled.div`
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ccc;
  background-color: #f9f9f9;
  gap: 6px;
`;

export const HeaderTitle = styled.h3`
  font-size: 16px;
  font-weight: normal;
  margin: 0;
  flex: 1;
`;

export const DownloadButton = styled.button`
  padding: 6px 12px;
  font-size: 14px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #005fc1;
  }
`;

export const FloatButton = styled.button<{ active?: boolean }>`
  padding: 6px 12px;
  font-size: 14px;
  background-color: ${({ active }) => (active ? '#6b7280' : '#6366f1')};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ active }) => (active ? '#4b5563' : '#4f46e5')};
  }
`;

export const SettingsToggleButton = styled.button<{ active?: boolean }>`
  padding: 6px 8px;
  font-size: 14px;
  background-color: ${({ active }) => (active ? '#d1d5db' : '#e5e7eb')};
  color: #374151;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #d1d5db;
  }
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

export const UserHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const ScrollAreaWrapper = styled.div`
  flex: 1;
  overflow: hidden;
`;
