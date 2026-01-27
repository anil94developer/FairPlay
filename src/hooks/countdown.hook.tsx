import { useEffect, useState } from "react";

export const useCountdown = (delay: number) => {
  const [count, setCount] = useState(delay);

  useEffect(() => {
    if (count <= 0) return;

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [count]);

  return count;
};
