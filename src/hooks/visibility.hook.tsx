import { useEffect, useState } from "react";

const getIsPageActive = (): boolean => {
  return document.visibilityState === "visible" && document.hasFocus();
};

export const usePageVisibility = (): boolean => {
  const [isActive, setIsActive] = useState<boolean>(getIsPageActive());

  useEffect(() => {
    const updatePageActiveState = () => {
      setIsActive(getIsPageActive());
    };

    document.addEventListener("visibilitychange", updatePageActiveState);
    window.addEventListener("focus", updatePageActiveState);
    window.addEventListener("blur", updatePageActiveState);

    return () => {
      document.removeEventListener("visibilitychange", updatePageActiveState);
      window.removeEventListener("focus", updatePageActiveState);
      window.removeEventListener("blur", updatePageActiveState);
    };
  }, []);

  return isActive;
};
