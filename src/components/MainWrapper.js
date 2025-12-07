'use client';

import { usePathname } from 'next/navigation';

export default function MainWrapper({ children }) {
  const pathname = usePathname();
  
  // No padding on login page (no navbar)
  const isLoginPage = pathname === '/login';
  
  return (
    <main className={isLoginPage ? 'px-4 pb-8' : 'pt-16 px-4 pb-8'}>
      <div className={isLoginPage ? '' : 'max-w-7xl mx-auto'}>
        {children}
      </div>
    </main>
  );
}
