import * as React from 'react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom/client';

export interface FloatingCaptionsEntry {
  captionId: string;
  captionText: string;
  userName: string;
  userColor: string;
  userAvatar: string;
}

interface FloatingCaptionsWindowProps {
  captions: FloatingCaptionsEntry[];
  locale: string;
  onClose: () => void;
}

function FloatingCaptionsContent(
  { captions, locale }: { captions: FloatingCaptionsEntry[]; locale: string },
): ReactNode {
  const lastTwo = captions.slice(-2);
  return (
    <div style={{
      fontFamily: 'sans-serif',
      padding: '12px 16px',
      background: 'rgba(0,0,0,0.55)',
      borderRadius: '10px',
      maxWidth: '560px',
      margin: '16px auto',
    }}
    >
      <div style={{
        fontSize: '11px',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}
      >
        {locale}
      </div>
      {lastTwo.length === 0 && (
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
          No captions yet...
        </div>
      )}
      {lastTwo.map((c) => (
        <div key={c.captionId} style={{ marginBottom: '6px' }}>
          <span style={{
            fontWeight: 'bold',
            color: c.userColor || '#fff',
            marginRight: '6px',
            fontSize: '13px',
          }}
          >
            {c.userName}
            :
          </span>
          <span style={{ color: '#fff', fontSize: '15px' }}>{c.captionText}</span>
        </div>
      ))}
    </div>
  );
}

export function FloatingCaptionsWindow(
  { captions, locale, onClose }: FloatingCaptionsWindowProps,
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
      return;
    }

    newWindowRef.current = win;
    win.document.title = `Live Captions – ${locale}`;

    const style = win.document.createElement('style');
    style.textContent = `
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
    root.render(<FloatingCaptionsContent captions={captions} locale={locale} />);

    win.addEventListener('beforeunload', onClose);
    setReady(true);

    return () => {
      win.removeEventListener('beforeunload', onClose);
      if (!win.closed) win.close();
    };
  }, []);

  useEffect(() => {
    if (ready && rootRef.current) {
      rootRef.current.render(
        <FloatingCaptionsContent captions={captions} locale={locale} />,
      );
    }
  }, [captions, ready]);

  return null;
}
