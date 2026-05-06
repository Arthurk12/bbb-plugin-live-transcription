import styled from 'styled-components';
import { colorPrimary, space2, space6 } from '../../styles-contants';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${space2};
  height: 100%;
  padding: ${space6};
  text-align: center;
`;

export const IconWrapper = styled.div`
  color: ${colorPrimary};
`;
