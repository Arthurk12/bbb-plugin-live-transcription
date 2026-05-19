export const GET_MEETING_DISABLED_FEATURES = `
  subscription getMeetingDisabledFeatures {
    meeting {
      disabledFeatures
    }
  }
`;

export const GET_CAPTION_ACTIVE_LOCALES = `
  subscription getCaptionActiveLocales {
    caption_activeLocales {
      locale
    }
  }
`;

const CAPTION_HISTORY_FIELDS = `
  user {
    avatar
    color
    name
    presenter
  }
  captionText
  captionId
  createdAt
`;

export const GET_CAPTIONS_SINCE = `
subscription getCaptionsSince($locale: String!, $since: timestamptz!) {
  caption_history(
    where: { locale: { _eq: $locale }, createdAt: { _gt: $since } }
    order_by: { createdAt: desc }
  ) {
    ${CAPTION_HISTORY_FIELDS}
  }
}
`;

export const SET_SPEECH_LOCALE = `
  mutation SetSpeechLocale($locale: String!, $provider: String!) {
    userSetSpeechLocale(
      locale: $locale,
      provider: $provider,
    )
  }
`;
