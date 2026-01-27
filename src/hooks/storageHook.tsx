import { useState, useEffect } from "react";

export const useMarketLocalState = () => {
  const [username, setUserName] = useState<string>("");
  const [multiMarketData, setMultiMarketData] = useState<any>([]);

  useEffect(() => {
    setUserName(sessionStorage.getItem("username") ?? "");
  }, []);

  useEffect(() => {
    setUserName(sessionStorage.getItem("username") ?? "");
  }, [sessionStorage.getItem("username")]);

  useEffect(() => {
    if (username) {
      let data = [];
      const mData = localStorage.getItem(`multiMarket_${username}`) ?? "";
      if (mData) data = JSON.parse(atob(mData)) ?? [];
      setMultiMarketData([...data]);
    }
  }, [username, localStorage.getItem(`multiMarket_${username}`)]);

  return [multiMarketData, setMultiMarketData];
};
