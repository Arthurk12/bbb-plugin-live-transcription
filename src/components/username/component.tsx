import * as React from 'react';
import { ReactNode } from 'react';
import { IntlShape, defineMessages } from 'react-intl';
import { BBBTypography } from '@bigbluebutton/bbb-ui-components-react';

interface UsernameProps {
  intl: IntlShape;
  user: {
    name: string;
    presenter: boolean;
  };
}

const intlMessages = defineMessages({
  presenterLabel: {
    id: 'sidekick.panel.username.presenterLabel',
    description: 'Label shown next to the name when the user is the presenter',
    defaultMessage: 'Presenter',
  },
});

export function Username({ user, intl }: UsernameProps): ReactNode {
  return (
    <BBBTypography variant="text2">
      {user.name}
      {user.presenter && ` (${intl.formatMessage(intlMessages.presenterLabel)})`}
    </BBBTypography>
  );
}
