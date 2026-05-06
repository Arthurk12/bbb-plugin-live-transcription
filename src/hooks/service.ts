type WindowWithSpeech = Window & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SpeechRecognition?: new (...args: unknown[]) => unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webkitSpeechRecognition?: new (...args: unknown[]) => unknown;
};

export const SpeechRecognitionAPI = (window as WindowWithSpeech).SpeechRecognition
  || (window as WindowWithSpeech).webkitSpeechRecognition;

export const hasSpeechRecognitionSupport = () => typeof SpeechRecognitionAPI !== 'undefined'
  && typeof window.speechSynthesis !== 'undefined';
