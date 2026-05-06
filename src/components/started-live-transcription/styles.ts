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
