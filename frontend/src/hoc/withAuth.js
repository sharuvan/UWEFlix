import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const validateToken = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        try {
          await axios.get('http://localhost:8000/api/validate_token/', {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          router.push('/login');
        }
      };

      validateToken();
    }, [router]);

    // If token is invalid or not present, router will redirect, component won't render anything
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
