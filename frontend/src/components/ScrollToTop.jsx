import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* ============================================================
   ScrollToTop — har route change pe page top pe le jaata hai.
   React Router SPA me page "change" sirf component swap hota hai,
   browser ki scroll position wahi rehti hai jahan thi (footer pe).
   Ye component useLocation sunta hai aur window ko top pe bhejta hai.
   ============================================================ */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
