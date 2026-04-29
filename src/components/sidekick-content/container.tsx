import { ReactNode, useCallback, useState } from 'react';
import * as React from 'react';
import * as Styled from './styles';
import { LiveTranscriptionSidekickContentProps } from './types';
import { GET_CAPTION_ACTIVE_LOCALES } from '../app/queries';
import { CaptionActiveLocaleGraphqlResponse } from '../app/types';
import { CaptionHistory } from './component';

let lastSelectedLocale: string | null = null;

export function LiveTranscriptionSidekickContent(
  { pluginApi, initialLocale, intl }: LiveTranscriptionSidekickContentProps,
): ReactNode {
  const [locale, setLocale] = useState(lastSelectedLocale ?? initialLocale);

  const {
    data: captionActiveLocalesResult,
    loading: captionActiveLocalesLoading,
  } = pluginApi.useCustomSubscription<
    CaptionActiveLocaleGraphqlResponse>(
      GET_CAPTION_ACTIVE_LOCALES,
    );

  const handleLocaleChange = useCallback((newLocale: string) => {
    lastSelectedLocale = newLocale;
    setLocale(newLocale);
  }, []);

  const subscriptionResolved = !captionActiveLocalesLoading
    && captionActiveLocalesResult && captionActiveLocalesResult.caption_activeLocales.length > 0;

  return (
    <Styled.Container>
      <Styled.Header>
        <Styled.HeaderTitle>
          { subscriptionResolved && (
            <Styled.Select
              value={locale}
              onChange={(e) => handleLocaleChange(e.target.value)}
            >
              {captionActiveLocalesResult?.caption_activeLocales.map(({ locale: activeLocale }) => (
                <option
                  key={activeLocale}
                  value={activeLocale}
                >
                  {activeLocale}
                </option>
              ))}
            </Styled.Select>
          )}
        </Styled.HeaderTitle>
      </Styled.Header>
      <CaptionHistory key={locale} pluginApi={pluginApi} locale={locale} intl={intl} />
    </Styled.Container>
  );
}
