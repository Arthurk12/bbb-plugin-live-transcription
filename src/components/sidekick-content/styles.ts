import styled from 'styled-components';
import { CaptionRowProps, UserAvatarInitialsProps } from './types';
import {
  btnPrimaryHoverBg,
  colorGrayDark,
  colorGrayLight,
  colorGrayLighter,
  colorHeading,
  colorPrimary,
  colorText,
  colorWhite,
  fontSizeBase,
  smPadding,
} from '../../styles-contants';

export const UserAvatarInitials = styled.div<UserAvatarInitialsProps>`
  background-color: ${({ background }) => background};
  height: 2rem;
  width: 2rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${colorWhite};
  font-size: ${fontSizeBase};
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
  border: 1px solid ${colorGrayLight};
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const ScrollArea = styled.div`
  overflow-y: auto;
  height: 100%;
  padding: 1rem;
  background-color: ${colorWhite};
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
  color: ${colorHeading};
`;

export const CaptionContent = styled.div`
  padding-left: 3rem;
`;

export const Timestamp = styled.span`
  font-size: 0.75rem;
  color: ${colorGrayDark};
  margin-right: 0.5rem;
`;

export const CaptionText = styled.p`
  color: ${colorText};
  margin: 0.25rem 0 0;
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
    background-color: ${btnPrimaryHoverBg};
  }
`;

export const Header = styled.div`
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${colorGrayDark};
  background-color: ${colorGrayLighter};
`;

export const HeaderTitle = styled.h3`
  font-size: ${smPadding};
  font-weight: normal;
  margin: 0;
`;

export const DownloadButton = styled.button`
  padding: 6px 12px;
  font-size: ${fontSizeBase};
  background-color: ${colorPrimary};
  color: ${colorWhite};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${btnPrimaryHoverBg};
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

export const Select = styled.select``;
