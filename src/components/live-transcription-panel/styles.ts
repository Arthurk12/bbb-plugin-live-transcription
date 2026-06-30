import styled from 'styled-components';
import {
  space2,
  space3,
  space4,
  space6,
  colorPrimary,
  colorTextDefault,
  colorGrayLight,
} from '../../styles-contants';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${space6};
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  text-align: center;
  padding: ${space6};
  gap: ${space2};
`;

export const IllustrationWrapper = styled.div`
  margin-bottom: ${space6};
`;

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${space4};
  width: 100%;
`;

export const UnsupportedUsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${space3};
  max-height: 240px;
  overflow-y: auto;
  padding: ${space3} 0;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 3px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.25);
    }
  }
`;

export const UnsupportedUserItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${space3};
  padding: ${space3} ${space4};
  border: 1px solid ${colorGrayLight};
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${colorTextDefault};
  word-break: break-word;
  transition: all 0.2s ease;
`;

export const InlineLink = styled.a`
  background: none;
  border: none;
  cursor: pointer;
  color: ${colorPrimary};
  font-weight: 600;
  padding: 0;
  text-decoration: underline;
`;
