import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchLogoUrl } from "../util/logoUtil";

type LogoContextValue = {
  logoSrc: string | null;
  loading: boolean;
  refreshLogo: () => Promise<void>;
};

const LogoContext = createContext<LogoContextValue>({
  logoSrc: null,
  loading: true,
  refreshLogo: async () => {},
});

export function LogoProvider({ children }: { children: React.ReactNode }) {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshLogo = useCallback(async () => {
    setLoading(true);
    const url = await fetchLogoUrl();
    setLogoSrc(url);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshLogo();
  }, [refreshLogo]);

  return (
    <LogoContext.Provider value={{ logoSrc, loading, refreshLogo }}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo(): LogoContextValue {
  const ctx = useContext(LogoContext);
  if (!ctx) {
    return {
      logoSrc: null,
      loading: false,
      refreshLogo: async () => {},
    };
  }
  return ctx;
}
