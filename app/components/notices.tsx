'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import sdk from '@farcaster/frame-sdk';
import styles from './notices.module.css';

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
  const [noticeContent, setNoticeContent] = useState<NoticeContent | null>(null);
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

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await fetch('/api/get-notice');
        const data: NoticeContent = await res.json();
        setNoticeContent(data);
      } catch (error) {
        console.error('Error fetching notice:', error);
      }
    };
    fetchNotice();
  }, []);

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
    <div ref={ref} className={styles['warningWidget']}>
      <button
        type="button"
        className={styles['closeButton']}
        onClick={closeWidget}
        aria-label="Close Widget"
      >
        &times;
      </button>
      <div className={styles['warningTitle']}>
        <strong>{noticeContent.title}</strong>
      </div>
      <div className={styles['warningContent']}>
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
