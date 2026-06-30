import * as React from 'react';
import {
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as ReactDOM from 'react-dom/client';

export interface FloatingCaptionsEntry {
  captionId: string;
  captionText: string;
  userName: string;
  userColor: string;
  userAvatar: string;
}

export type OutlineStyle = 'none' | 'outline' | 'shadow' | 'glow';

export interface FloatingCaptionsFontSettings {
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontColor: string;
  showUserName: boolean;
  fontFamily: string;
  userNameColor: string;
  userNameBold: boolean;
  outlineColor: string;
  outlineStyle: OutlineStyle;
  outlineSize: number;
  backgroundColor: string;
}

export interface FloatingCaptionsSplitSettings {
  lineLimit: number;
  linesPerMessage: number;
}

interface FloatingCaptionsWindowProps {
  captions: FloatingCaptionsEntry[];
  locale: string;
  fontSettings: FloatingCaptionsFontSettings;
  splitSettings: FloatingCaptionsSplitSettings;
  onClose: () => void;
}

function splitCaption(
  entry: FloatingCaptionsEntry,
  lineLimit: number,
  linesPerMessage: number,
): FloatingCaptionsEntry[] {
  const transcripts: string[] = [];
  const words = entry.captionText.split(' ');

  let currentLine = '';
  let result = '';

  words.forEach((word) => {
    if ((currentLine + word).length <= lineLimit) {
      currentLine += `${word} `;
    } else {
      result += `${currentLine.trim()}\n`;
      currentLine = `${word} `;
    }

    if (result.split('\n').length > linesPerMessage) {
      transcripts.push(result);
      result = '';
    }
  });

  if (result.length) {
    transcripts.push(result);
  }
  transcripts.push(currentLine.trim());

  return transcripts
    .filter((t) => t.trim().length > 0)
    .map((t, i) => ({
      ...entry,
      captionText: t,
      captionId: `${entry.captionId}-${i + 1}`,
    }));
}

function getOutlineCss(
  outlineStyle: OutlineStyle,
  outlineColor: string,
  outlineSize: number,
): React.CSSProperties {
  switch (outlineStyle) {
    case 'outline':
      return { WebkitTextStroke: `${outlineSize}px ${outlineColor}` };
    case 'shadow':
      return { textShadow: `${outlineSize}px ${outlineSize}px ${outlineSize * 2}px ${outlineColor}` };
    case 'glow':
      return { textShadow: `0 0 ${outlineSize * 4}px ${outlineColor}, 0 0 ${outlineSize * 8}px ${outlineColor}` };
    default:
      return {};
  }
}

function FloatingCaptionsContent(
  { captions, fontSettings, splitSettings }: {
    captions: FloatingCaptionsEntry[];
    fontSettings: FloatingCaptionsFontSettings;
    splitSettings: FloatingCaptionsSplitSettings;
  },
): ReactNode {
  const lastTwo = captions
    .slice(0, 2) // get first two
    .reverse() // revert order before split
    .flatMap((c) => splitCaption(c, splitSettings.lineLimit, splitSettings.linesPerMessage))
    .slice(-2); // get the last two

  const outlineCss = getOutlineCss(
    fontSettings.outlineStyle,
    fontSettings.outlineColor,
    fontSettings.outlineSize,
  );

  return (
    <div style={{
      fontFamily: fontSettings.fontFamily,
      padding: '12px 16px',
      backgroundColor: fontSettings.backgroundColor,
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      overflow: 'auto',
    }}
    >
      {lastTwo.length === 0 && (
        <div style={{ color: 'rgba(0,0,0,0.4)', fontSize: `${fontSettings.fontSize}px` }}>
          No captions yet...
        </div>
      )}
      {lastTwo.map((c) => (
        <div key={c.captionId} style={{ marginBottom: '6px' }}>
          {fontSettings.showUserName && (
            <span style={{
              fontWeight: fontSettings.userNameBold ? 'bold' : 'normal',
              color: fontSettings.userNameColor,
              marginRight: '6px',
              fontSize: `${fontSettings.fontSize}px`,
              fontFamily: fontSettings.fontFamily,
              ...outlineCss,
            }}
            >
              {c.userName}
              :
            </span>
          )}
          <span style={{
            color: fontSettings.fontColor,
            fontSize: `${fontSettings.fontSize}px`,
            fontWeight: fontSettings.fontWeight,
            fontFamily: fontSettings.fontFamily,
            ...outlineCss,
          }}
          >
            {c.captionText}
          </span>
        </div>
      ))}
    </div>
  );
}

export function FloatingCaptionsWindow(
  {
    captions,
    locale,
    fontSettings,
    splitSettings,
    onClose,
  }: FloatingCaptionsWindowProps,
): ReactNode {
  const newWindowRef = useRef<Window | null>(null);
  const rootRef = useRef<ReactDOM.Root | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const win = window.open(
      '',
      `floating-captions-${locale}`,
      'width=600,height=160,menubar=no,toolbar=no,location=no,status=no,resizable=yes',
    );

    if (!win) {
      // eslint-disable-next-line no-console
      console.warn('FloatingCaptionsWindow: could not open popup window. It may have been blocked.');
      onClose();
      return () => { };
    }

    newWindowRef.current = win;
    win.document.title = `Live Captions – ${locale}`;

    const style = win.document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Merriweather:wght@400;700&family=Roboto+Mono:wght@400;700&family=Nunito:wght@400;700&display=swap');
      html, body {
        margin: 0;
        padding: 0;
        background: transparent;
        overflow: hidden;
      }
    `;
    win.document.head.appendChild(style);

    const container = win.document.createElement('div');
    win.document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    rootRef.current = root;
    root.render(
      <FloatingCaptionsContent
        captions={captions}
        fontSettings={fontSettings}
        splitSettings={splitSettings}
      />,
    );

    win.addEventListener('beforeunload', onClose);

    const handleParentUnload = () => {
      if (!win.closed) win.close();
    };
    window.addEventListener('pagehide', handleParentUnload);

    setReady(true);

    return () => {
      win.removeEventListener('beforeunload', onClose);
      window.removeEventListener('pagehide', handleParentUnload);
      if (!win.closed) win.close();
    };
  }, []);

  useEffect(() => {
    if (ready && rootRef.current) {
      rootRef.current.render(
        <FloatingCaptionsContent
          captions={captions}
          fontSettings={fontSettings}
          splitSettings={splitSettings}
        />,
      );
    }
  }, [captions, fontSettings, splitSettings, ready]);

  return null;
}
