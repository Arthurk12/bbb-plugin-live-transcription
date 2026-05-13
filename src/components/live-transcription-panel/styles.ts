import styled from 'styled-components';
import { space2, space4, space6, colorPrimary } from '../../styles-contants';

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

export const InlineLink = styled.a`
  background: none;
  border: none;
  cursor: pointer;
  color: ${colorPrimary};
  font-weight: 600;
  padding: 0;
  text-decoration: underline;
`;
