'use client';
import { createContext, useContext } from 'react';

type TenantCtx = {
  tenantId: string;
  userId: string;
  storeName: string;
};

const TenantContext = createContext<TenantCtx>({ tenantId: '', userId: '', storeName: '' });

export function useTenant(): TenantCtx {
  return useContext(TenantContext);
}

export function TenantProvider({
  children,
  tenantId,
  userId,
  storeName,
}: TenantCtx & { children: React.ReactNode }) {
  return (
    <TenantContext.Provider value={{ tenantId, userId, storeName }}>
      {children}
    </TenantContext.Provider>
  );
}
