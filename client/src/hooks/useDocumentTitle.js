import { useEffect } from 'react';

const BASE_TITLE = 'BigO | Track your coding journey';

/**
 * Set the tab title to "<title> | BigO".
 * Pass a falsy value for the default site title (landing page).
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | BigO` : BASE_TITLE;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
