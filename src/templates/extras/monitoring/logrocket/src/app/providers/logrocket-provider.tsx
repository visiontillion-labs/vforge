'use client';

import LogRocket from 'logrocket';
import { useEffect } from 'react';

export const LogRocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
      LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID);
    }
  }, []);

  return <>{children}</>;
};
