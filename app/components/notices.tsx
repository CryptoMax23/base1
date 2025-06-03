'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import sdk from '@farcaster/frame-sdk';
import '../../styles/notices.css';

interface Contact {
  label: string;
  url: string;
}

interface NoticeContent {
  title: string;
  warning: string;
  message: string;
  contacts: Contact[];
  footer: string;
}

interface FcContext {
  user?: {
    fid: number;
  };
  actions?: {
    openUrl: (url: string) => void;
  };
}

export default function Notices() {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [fcContext, setFcContext] = useState<FcContext | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const closeWidget = () => setIsVisible(false);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) closeWidget();
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    (async () => {
      const ctx = await sdk.context;
      setFcContext(ctx);
    })();
  }, []);

  // Static Notice Content
  const noticeContent: NoticeContent = {
    title: "⚠️ Before You Explore",
    warning: "A Creative District is an ongoing endeavor!",
    message: "Keep an eye out for information about upcoming summer events including Tabor Days, and when the new ownership of the Broken Spoke is ready we'd love to integrate your menu right here on the map too!",
    contacts: [
      { label: 'steve@astagereborn.com', url: 'mailto:steve@astagereborn.com' },
      { label: 'Facebook (Page + Messenger)', url: 'https://facebook.com/astagereborn' },
      { label: 'Farcaster (@Pederzani.ETH)', url: 'https://warpcast.com/pederzani.eth' },
      { label: 'Discord (@Pederzani.ETH)', url: 'https://discord.gg/astagereborn' },
      { label: 'X (@AStageReborn)', url: 'https://x.com/astagereborn' },
    ],
    footer: "This is just the beginning. I look forward to building this free community driven utility for interactive public activities and information to serve Minatare, the developing Creative District, and beyond!\n- Steve",
  };

  const handleLinkClick = (url: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isFarLink = /^https?:\/\//i.test(url);
    const inMiniApp = !!fcContext?.user?.fid && typeof sdk.actions?.openUrl === 'function';

    if (inMiniApp && isFarLink) {
      e.preventDefault();
      sdk.actions.openUrl(url);
    }
  };

  if (!noticeContent || !isVisible) return null;

  return (
    <div ref={ref} className="warningWidget">
      <button
        type="button"
        className="closeButton"
        onClick={closeWidget}
        aria-label="Close Widget"
      >
        &times;
      </button>
      <div className="warningTitle">
        <strong>{noticeContent.title}</strong>
      </div>
      <div className="warningContent">
        <small><br />
          <strong>{noticeContent.warning}</strong><br /><br />
          {noticeContent.message}<br /><br />
          {noticeContent.contacts.map((contact, idx) => (
            <React.Fragment key={idx}>
              &nbsp;-&nbsp;&nbsp;
              <a href={contact.url} onClick={handleLinkClick(contact.url)} target="_blank" rel="noopener noreferrer">
                {contact.label}
              </a>
              <br />
            </React.Fragment>
          ))}
          <br />
          {noticeContent.footer}
        </small>
      </div>
    </div>
  );
}
