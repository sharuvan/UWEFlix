import { useEffect } from 'react';
import Router from 'next/router';

const useSessionTimeout = (timeoutMinutes) => {
  useEffect(() => {
    const timeout = timeoutMinutes * 60 * 1000;

    const handleLogout = () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      Router.push('/login');
    };

    const resetTimeout = () => {
      clearTimeout(window.sessionTimeout);
      window.sessionTimeout = setTimeout(handleLogout, timeout);
      resetTimeout();
    };

    window.addEventListener('click', resetTimeout);
    window.addEventListener('keypress', resetTimeout);

    resetTimeout();

    return () => {
      clearTimeout(window.sessionTimeout);
      window.removeEventListener('click', resetTimeout);
      window.removeEventListener('keypress', resetTimeout);
    };
  }, [timeoutMinutes]);
};

export default useSessionTimeout;
