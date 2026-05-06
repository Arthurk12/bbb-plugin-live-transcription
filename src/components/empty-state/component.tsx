import React, { ReactNode } from 'react';
import { defineMessages, IntlShape } from 'react-intl';
import { BBBTypography } from '@mconf/bbb-ui-components-react';
import * as Styled from './styles';

interface EmptyStateProps {
  intl: IntlShape,
}

function EmptyStateIconSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M28.3333 16.6663C27.4167 16.6663 26.6319 16.3469 25.9792 15.708C25.3264 15.0691 25 14.2775 25 13.333V6.66634C25 5.7219 25.3264 4.93023 25.9792 4.29134C26.6319 3.65245 27.4167 3.33301 28.3333 3.33301C29.2778 3.33301 30.0694 3.65245 30.7083 4.29134C31.3472 4.93023 31.6667 5.7219 31.6667 6.66634V13.333C31.6667 14.2775 31.3472 15.0691 30.7083 15.708C30.0694 16.3469 29.2778 16.6663 28.3333 16.6663ZM8.33333 36.6663C7.41667 36.6663 6.63194 36.34 5.97917 35.6872C5.32639 35.0344 5 34.2497 5 33.333V6.66634C5 5.74967 5.32639 4.96495 5.97917 4.31217C6.63194 3.6594 7.41667 3.33301 8.33333 3.33301H21.6667V6.66634H8.33333V33.333H26.6667V29.9997H30V33.333C30 34.2497 29.6736 35.0344 29.0208 35.6872C28.3681 36.34 27.5833 36.6663 26.6667 36.6663H8.33333ZM11.6667 29.9997V26.6663H23.3333V29.9997H11.6667ZM11.6667 24.9997V21.6663H20V24.9997H11.6667ZM30 26.6663H26.6667V22.333C24.5278 21.9441 22.7431 20.9094 21.3125 19.2288C19.8819 17.5483 19.1667 15.583 19.1667 13.333H22.5C22.5 14.9441 23.0694 16.3191 24.2083 17.458C25.3472 18.5969 26.7222 19.1663 28.3333 19.1663C29.9722 19.1663 31.3542 18.5969 32.4792 17.458C33.6042 16.3191 34.1667 14.9441 34.1667 13.333H37.5C37.5 15.583 36.7917 17.5483 35.375 19.2288C33.9583 20.9094 32.1667 21.9441 30 22.333V26.6663Z"
        fill="currentColor"
      />
    </svg>
  );
}

const intlMessages = defineMessages({
  title: {
    id: 'sidekick.panel.emptyState.title',
    description: 'Title shown when there are no captions',
    defaultMessage: 'Nothing to transcribe',
  },
  subtitle: {
    id: 'sidekick.panel.emptyState.subtitle',
    description: 'Subtitle shown when there are no captions',
    defaultMessage: 'Waiting for participants to speak...',
  },
  iconAlt: {
    id: 'sidekick.panel.emptyState.iconAlt',
    defaultMessage: 'Speech to text Icon',
    description: 'Alternative text for the speech to text icon',
  },
});

export function EmptyState({ intl }: EmptyStateProps): ReactNode {
  return (
    <Styled.Container>
      <Styled.IconWrapper>
        <EmptyStateIconSVG
          width={40}
          height={40}
          aria-label={intl.formatMessage(intlMessages.iconAlt)}
          role="img"
        />
      </Styled.IconWrapper>
      <BBBTypography variant="header">
        {intl.formatMessage(intlMessages.title)}
      </BBBTypography>
      <BBBTypography variant="text2">
        {intl.formatMessage(intlMessages.subtitle)}
      </BBBTypography>
    </Styled.Container>
  );
}
