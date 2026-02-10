import React, { useCallback, useEffect, useRef, useState } from "react";
import { connect, useSelector } from "react-redux";

import { RootState } from "../../models/RootState";
import {
  getAllMarketsByEvent,
  addExchangeBet,
  getCurrencyTypeFromToken,
  isFancyMarketSuspended,
} from "../../store";
import "./ExchFancyMarketsTable.scss";

import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Paper from "@material-ui/core/Paper";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";

import { PlaceBetRequest } from "../../models/BsData";
import ExchOddBtn from "../ExchOddButton/ExchOddButton";
import { UserBet } from "../../models/UserBet";
import moment from "moment";
import { EventDTO } from "../../models/common/EventDTO";
import { FancyMarketDTO } from "../../models/common/FancyMarketDTO";
import API from "../../api";
import Modal from "../../components/Modal/Modal";
import MarketTermsCondi from "../../components/MarketTermsCondi/MarketTermsCondi";
import FancyBookView from "./FancyBookView/FancyBookView";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { ThousandFormatter } from "../../util/stringUtil";
import CloseOutlined from "@material-ui/icons/CloseOutlined";
import ExpandLessSharpIcon from "@material-ui/icons/ExpandLessSharp";
import ExchBetslip from "../ExchBetslip/ExchBetslip";
import { isMobile } from "react-device-detect";
import { isFancyMarketDisabled } from "../../store/exchangeSports/exchangeSportsSelectors";
import CATALOG_API from "../../catalog-api";
import { oneClickBetPlaceHandler } from "../../store/exchBetslip/exchBetslipActions";
import { OneClickBettingCountdown } from "../OneClickBetting/OneClickCountdown";
import { setAlertMsg } from "../../store/common/commonActions";
import { AlertDTO } from "../../models/Alert";
import USABET_API from "../../api-services/usabet-api";

type StoreProps = {
  eventData: EventDTO;
  fmData: FancyMarketDTO[];
  openBets: UserBet[];
  commissionEnabled: boolean;
  addExchangeBet: (data: PlaceBetRequest) => void;
  loggedIn: boolean;
  getFormattedMinLimit: (num: number) => string;
  getFormattedMaxLimit: (num: number) => string;
  bets: PlaceBetRequest[];
  exposureMap: any;
  fancySuspended: boolean;
  fancyDisabled: boolean;
  fetchEvent: (
    sportId: string,
    competitionId: string,
    eventId: string,
    marketTime: string
  ) => void;
  setBetStartTime: Function;
  setAddNewBet: Function;
  marketNotifications: any;
  setAlertMsg: Function;
  langData: any;
  bettingInprogress: boolean;
  fancyCategoryMap?: any; // Optional: category mapping from API { "0": "NORMAL", "1": "Session Markets", ... }
  /** Keys "match_id_fancy_id" -> liability; if key exists for this fancy, show Active Book button */
  fancyLiabilityMap?: Record<string, number> | null;
};

type OddsInfoMsg = {
  launch: boolean;
  oddsType: string;
  eventTypeID: string;
};

const FMTable: React.FC<StoreProps> = (props) => {
  const {
    eventData,
    fmData,
    bets,
    openBets,
    commissionEnabled,
    addExchangeBet,
    loggedIn,
    exposureMap,
    fancySuspended,
    fancyDisabled,
    setBetStartTime,
    setAddNewBet,
    marketNotifications,
    setAlertMsg,
    langData,
    bettingInprogress,
    fancyCategoryMap = {},
    fancyLiabilityMap = null,
  } = props;


  // alert(JSON.stringify(eventData))
  console.log("[FMTable] eventData====3333=======:", eventData);
  // Ensure fmData is always an array to prevent iteration errors
  const safeFmData = Array.isArray(fmData) ? fmData : [];

  const {
    oneClickBettingEnabled,
    oneClickBettingStake,
    oneClickBettingLoading,
  } = useSelector((state: RootState) => state.exchBetslip);

  const disabledStatus = ["suspended", "suspended-manually", "ball_running"];
  const [showBooksModal, setShowBooksModal] = useState<boolean>(false);
  const [fancyBookOutcomeId, setFancyBookOutcomeId] = useState<string>();
  const [fancyBookOutcomeName, setFancyBookOutcomeName] = useState<string>();

  const [fancyCategories, setFancyCategories] = useState<Array<{id: string, name: string}>>([]);
  const [fancyData, setFancyData] = useState<FancyMarketDTO[]>([]);

  const [notifications, setNotifications] = useState<Map<String, string>>(
    new Map()
  );

  // Create dynamic category order from actual data (API only, no static fallback)
  const [dynamicCategoriesOrder, setDynamicCategoriesOrder] = useState<any[]>([]);
  const [tabVal, setTabVal] = useState(0);
  const [selectedRow, setSelectedRow] = useState<string>("");
  const [infoDilalog, setInfoDialog] = useState<OddsInfoMsg>({
    launch: false,
    oddsType: null,
    eventTypeID: null,
  });
  const [marketLimits, setMarketLimits] = useState<any>({});
  const marketLimitsRef = useRef<any>({});
  // Helper to check fancy liability map using multiple possible id formats
  // const hasFancyLiability = (marketId: string | number) => {
  //   console.log('marketId=============================', marketId);
  //   try {
  //     if (!fancyLiabilityMap) return false;
  //     const eventIds = [eventData?.eventId, eventData?.id].filter(Boolean).map(String);
  //     const mIds = [marketId].filter(Boolean).map(String);
  //     for (const eId of eventIds) {
  //       for (const mId of mIds) {
  //         const key = `${eId}_${mId}`;
  //         if (Object.prototype.hasOwnProperty.call(fancyLiabilityMap, key)) return true;
  //       }
  //     }
  //     return false;
  //   } catch (err) {
  //     console.warn('[FMTable] hasFancyLiability error', err);
  //     return false;
  //   }
  // };
  const hasFancyLiability = (marketId: string | number) => {
  try {
    if (!fancyLiabilityMap || !marketId) return false;

    const key = String(marketId);

    return Object.prototype.hasOwnProperty.call(fancyLiabilityMap, key);
  } catch (err) {
    console.warn('[FMTable] hasFancyLiability error', err);
    return false;
  }
};

  const [filteredFancyMarketsData, setFilteredFancyMarketsData] = useState<
    FancyMarketDTO[]
  >([]);
  const [hasScrolledToBetslip, setHasScrolledToBetslip] =
    useState<boolean>(false);

  // Reset scroll state when bets change
  useEffect(() => {
    setHasScrolledToBetslip(false);
  }, [bets]);

  const isFancyDisabled = (fMarketDisabled: boolean) => {
    return fancyDisabled ? true : fMarketDisabled;
  };

  const fetchBetLimits = async (marketId: string, localMCategory: string) => {
    try {
      const payload = {
        competitionId: eventData.competitionId,
        eventId: eventData.eventId,
        marketId: marketId,
        marketType: "FANCY",
        outcomeDesc: "fancy",
        sessionId: marketId,
        sportId: eventData.sportId,
        mcategory: localMCategory,
      };

      let response;
      if (sessionStorage.getItem("jwt_token")) {
        response = await CATALOG_API.post(
          "/catalog/v2/limits/market",
          payload,
          {
            headers: {
              Authorization: sessionStorage.getItem("jwt_token"),
            },
          }
        );
      } else {
        response = await CATALOG_API.post("/catalog/v2/limits/market", payload);
      }
      if (response.status === 200 && response.data.success) {
        let limits = marketLimits;

        limits[marketId ? marketId : eventData.marketId] = {
          minStake: response.data.limits.minStake,
          maxStake: response.data.limits.maxStake,
          maxOdd: response.data.limits.maxOdd,
        };

        setMarketLimits((marketLimits) => {
          return {
            ...marketLimits,
            ...limits,
          };
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];

  const getFancyMarketsByGroup = (category: string) => {
    return safeFmData
      .filter((fm) => fm.category === category)
      .sort((a, b) => {
        if (a?.sort - b?.sort != 0) {
          return a?.sort - b?.sort;
        }
        const aDesc = a.marketName;
        const bDesc = b.marketName;
        if (aDesc > bDesc) return 1;
        else if (aDesc < bDesc) return -1;
        return 0;
      });
  };

  useEffect(() => {
    if (marketNotifications) {
      const map = new Map();
      marketNotifications.forEach((msgObj) => {
        map.set(msgObj.marketId, msgObj.message);
      });
      setNotifications(map);
    }
  }, [marketNotifications]);

  useEffect(() => {
    // If parent provided fmData (from ExchangeAllMarkets polling), prefer that and skip internal fetch
    if (Array.isArray(fmData) && fmData.length > 0) {
      console.log("[FMTable] Parent fmData detected - using parent data and skipping internal fetch");
      try {
        setFancyData(fmData);
        if (tabVal === 0) setFilteredFancyMarketsData(fmData);
        // Sync categories if parent provided a mapping
        if (fancyCategoryMap && Object.keys(fancyCategoryMap).length > 0) {
          const categoriesArray = Object.entries(fancyCategoryMap).map(([id, name]) => ({ id, name: String(name) }));
          setFancyCategories(categoriesArray);
          const dynamicOrder = categoriesArray.map((fc) => ({ fancyCategory: fc.name, langKey: fc.name.toLowerCase().replace(/\s+/g, '_'), label: fc.name }));
          setDynamicCategoriesOrder(dynamicOrder);
        }
      } catch (err) {
        console.warn('[FMTable] Error syncing parent fmData:', err);
      }
      return;
    }

    const fetchFancy = async () => {
      // Use eventData from props - check both eventId and id properties
      let eventIdToUse = eventData?.eventId || eventData?.id;
      
      // Fallback: try to extract from marketId in fmData
      if (!eventIdToUse && safeFmData.length > 0 && safeFmData[0]?.marketId) {
        const marketIdParts = safeFmData[0].marketId.split('_');
        eventIdToUse = marketIdParts[0];
        console.log("[FMTable] Extracted eventId from marketId:", eventIdToUse);
      }
      
      if (!eventIdToUse) {
        console.log("[FMTable] No eventId available, skipping fetch.");
        console.log("[FMTable] eventData:", eventData);
        console.log("[FMTable] eventData?.eventId:", eventData?.eventId);
        console.log("[FMTable] eventData?.id:", eventData?.id);
        console.log("[FMTable] safeFmData.length:", safeFmData.length);
        if (safeFmData.length > 0) {
          console.log("[FMTable] First market:", safeFmData[0]);
        }
        return;
      }
      
      console.log("[FMTable] ✅ Fetching categories for eventId:", eventIdToUse);
      console.log("[FMTable] eventData received:", eventData);
      
      try {
        const response = await USABET_API.post(`/fancy/getFancies`, {
          match_id: eventIdToUse,
          combine: true,
        });
        
        if (response.status === 200 && response.data) {
          console.log("[FMTable] Fancy API response:", response.data);
          console.log("[FMTable] fancy_category object:", response.data.fancy_category);
          
          // Convert fancy_category object to array
          const categoryObj = response.data.fancy_category || {};
          const categoriesArray = Object.entries(categoryObj).map(([id, name]) => ({
            id: id,
            name: String(name)
          }));
          
          console.log("[FMTable] Converted categories array:", categoriesArray);
          console.log("[FMTable] Categories array length:", categoriesArray.length);
          
          // Always set categories even if data array is empty
          if (categoriesArray.length > 0) {
            setFancyCategories(categoriesArray);
            console.log("[FMTable] ✅ Set fancyCategories state with", categoriesArray.length, "categories");
            
            // Build dynamicCategoriesOrder from API categories
            const dynamicOrder = categoriesArray.map((fc) => ({
              fancyCategory: fc.name, // Use the actual category name from API
              langKey: fc.name.toLowerCase().replace(/\s+/g, '_'),
              label: fc.name,
            }));
            setDynamicCategoriesOrder(dynamicOrder);
            console.log("[FMTable] ✅ Set dynamicCategoriesOrder with", dynamicOrder.length, "categories");
          } else {
            console.warn("[FMTable] ⚠️ No categories found in API response");
          }
          
          if (response.data.data && Array.isArray(response.data.data)) {
            // Transform raw API data to FancyMarketDTO format
            const transformedFancyData = response.data.data.map((fancy: any) => {
              // Extract market ID - API uses fancy_id
              const marketId = fancy.fancy_id || fancy.market_id || fancy.marketId || fancy.id || "";
              // Extract market name - API uses name or fancy_name
              const marketName = fancy.name || fancy.fancy_name || fancy.market_name || fancy.marketName || "";
              
              // Extract status
              let status = "OPEN";
              if (fancy.GameStatus && fancy.GameStatus !== "") {
                status = fancy.GameStatus.toUpperCase();
              } else if (fancy.is_active === 0) {
                status = "SUSPENDED";
              } else if (fancy.MarkStatus === "1" || fancy.MarkStatus === 1) {
                status = "SUSPENDED";
              } else if (fancy.is_lock === true || fancy.isLock === true) {
                status = "SUSPENDED";
              } else if (fancy.status) {
                status = fancy.status.toUpperCase();
              }
              
              // Map category using fancy_category mapping from API response
              const categoryId = fancy.category !== undefined ? String(fancy.category) : "0";
              // Get category name from the categoryObj (fancy_category from API)
              const categoryName = categoryObj[categoryId] 
                ? String(categoryObj[categoryId])
                : categoryId;
              // Use category name directly (e.g., "Session Markets", "NORMAL", etc.)
              const category = categoryName || categoryId;
              
              // Extract prices
              const parsePrice = (val: any): number | null => {
                if (val === null || val === undefined || val === "" || val === "--") return null;
                const num = typeof val === "number" ? val : parseFloat(String(val));
                return isNaN(num) ? null : num;
              };
              
              let layPrice = parsePrice(fancy.LayPrice1 || fancy.LayPrice || fancy.layPrice1 || fancy.layPrice || fancy.noValue);
              let laySize = parsePrice(fancy.LaySize1 || fancy.LaySize || fancy.laySize1 || fancy.laySize || fancy.noRate);
              let backPrice = parsePrice(fancy.BackPrice1 || fancy.BackPrice || fancy.backPrice1 || fancy.backPrice || fancy.yesValue);
              let backSize = parsePrice(fancy.BackSize1 || fancy.BackSize || fancy.backSize1 || fancy.backSize || fancy.yesRate);
              
              // Extract limits
              const minStake = fancy.Min || fancy.session_min_stack || fancy.session_before_inplay_min_stack || 100;
              const maxStake = fancy.Max || fancy.session_max_stack || fancy.session_before_inplay_max_stack || 100000;
              
              // Determine suspend/disable status
              const markStatus = fancy.MarkStatus === "1" || fancy.MarkStatus === 1;
              const isSuspended = markStatus || fancy.is_lock === true || fancy.isLock === true || 
                (status === "SUSPENDED" && !fancy.GameStatus);
              const isDisabled = fancy.is_active === 0 || isSuspended;
              
              // Extract series name from API response
              const seriesName = fancy.series_name || fancy.seriesName || fancy.series || fancy.series_id || "";
              
              return {
                marketId: marketId,
                marketName: marketName,
                customMarketName: fancy.customMarketName || marketName,
                status: status,
                sort: fancy.chronology !== undefined ? Number(fancy.chronology) : (fancy.sort ? Number(fancy.sort) : 0),
                layPrice: layPrice,
                backPrice: backPrice,
                laySize: laySize,
                backSize: backSize,
                category: category,
                seriesName: seriesName, // Add series name to the market data
                commissionEnabled: fancy.is_commission_applied || fancy.commissionEnabled || false,
                marketLimits: fancy.marketLimits || {
                  minStake: minStake,
                  maxStake: maxStake,
                  maxOdd: fancy.maxOdd || 4,
                  delay: fancy.delay || 0,
                },
                suspend: isSuspended,
                disable: isDisabled,
                limits: {
                  minBetValue: minStake,
                  maxBetValue: maxStake,
                },
                isMarketLimitSet: !!fancy.marketLimits,
              };
            });
            
            setFancyData(transformedFancyData);
            console.log("[FMTable] ✅ Set transformed fancyData with", transformedFancyData.length, "items");
            console.log("[FMTable] Sample transformed fancy market:", transformedFancyData[0]);
            
            // Initialize filteredFancyMarketsData with all data when "All" tab is selected (tabVal === 0)
            if (tabVal === 0 && transformedFancyData.length > 0) {
              setFilteredFancyMarketsData(transformedFancyData);
              console.log("[FMTable] ✅ Initialized filteredFancyMarketsData with all data for 'All' tab");
            }
          } else {
            console.log("[FMTable] No data array in response");
            setFancyData([]);
            if (tabVal === 0) {
              setFilteredFancyMarketsData([]);
            }
          }
        }
      } catch (error) {
        console.error("[FMTable] Error fetching fancy categories:", error);
        setFancyData([]);
        if (tabVal === 0) {
          setFilteredFancyMarketsData([]);
        }
      }
    };
    
    fetchFancy();
  }, [eventData?.eventId, eventData?.competitionId, fmData, fancyCategoryMap, tabVal]);
  
  // Initialize filteredFancyMarketsData when fancyData or safeFmData changes and "All" is selected
  // Prefer parent fmData (refreshed every 3s) so UI updates when getFancies is polled
  useEffect(() => {
    if (tabVal === 0) {
      const allData = safeFmData.length > 0 ? safeFmData : fancyData;
      if (allData.length > 0) {
        if (filteredFancyMarketsData.length === 0 || 
            filteredFancyMarketsData.length !== allData.length ||
            JSON.stringify(filteredFancyMarketsData) !== JSON.stringify(allData)) {
          setFilteredFancyMarketsData(allData);
          console.log("[FMTable] ✅ Initialized filteredFancyMarketsData for 'All' tab with", allData.length, "items");
        }
      }
    }
  }, [fancyData, safeFmData, tabVal]);

  // If parent supplies fmData, derive categories and ensure filtered list reflects fmData
  useEffect(() => {
    if (Array.isArray(fmData) && fmData.length > 0) {
      try {
        console.log('[FMTable] Deriving categories from parent fmData - items:', fmData.length);
        const uniqueCats = Array.from(new Set(fmData.map((m) => String(m.category || '0').trim()))).filter(Boolean);
        const categoriesArray = uniqueCats.map((id) => ({ id, name: id }));
        setFancyCategories(categoriesArray);
        const dynamicOrder = categoriesArray.map((fc) => ({ fancyCategory: fc.name, langKey: fc.name.toLowerCase().replace(/\s+/g, '_'), label: fc.name }));
        setDynamicCategoriesOrder(dynamicOrder);

        // If 'All' tab selected, show parent data immediately
        if (tabVal === 0) {
          setFilteredFancyMarketsData(fmData);
        }
      } catch (err) {
        console.warn('[FMTable] Error deriving categories from fmData:', err);
      }
    }
  }, [fmData, tabVal]);
  // console.log("[FMTable] eventData===========:", eventData);

  return (
    <>
      <div className="fm-table-ctn">
        <div
          className="fm-table-content table-ctn"
          style={{ position: "relative" }}
        >
          {(bettingInprogress || oneClickBettingLoading) &&
            bets?.[0]?.marketType === "FANCY" && (
              <OneClickBettingCountdown delay={bets?.[0]?.delay || 0} />
            )}
          <TableContainer component={Paper} style={{ overflow: 'hidden', width: '100%' }}>
            <Table className="fm-table" style={{ tableLayout: 'auto', width: '100%' }}>
              <TableHead>
                {/* Only show tabs if there's fancy data available */}
                {(safeFmData.length > 0 || fancyData.length > 0) && (
                <TableRow>
                  <TableCell className="tabs-table-cell" colSpan={12} style={{ padding: 0, overflow: 'hidden', width: '100%' }}>
                    <div className="tabs-fancy" style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', display: 'flex', flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch' }}>

                        <span
                          className={tabVal === 0 ? "sel-tab" : "ind-tab"}
                          onClick={() => {
                            setTabVal(0);
                          // Prefer parent safeFmData (refreshed every 3s) so UI shows latest
                          const allData = safeFmData.length > 0 ? safeFmData : fancyData;
                          setFilteredFancyMarketsData(allData);
                          console.log("[FMTable] Showing all markets:", allData.length);
                          }}
                        >
                        <div>{langData?.["all"] || "ALL"}</div>
                        </span>

                      {/* Only dynamic categories from API (no static fallback) */}
                      {fancyCategories.length > 0 &&
                        fancyCategories.map((fc, index) => {
                          const tabIndex = index + 1;
                          return (
                          <span
                              key={`category-${fc.id}-${index}`}
                              className={tabVal === tabIndex ? "sel-tab" : "ind-tab"}
                            onClick={() => {
                                setTabVal(tabIndex);
                                const dataSource = safeFmData.length > 0 ? safeFmData : fancyData;
                                const filtered = dataSource.filter((fm) => {
                                  const marketCategory = String(fm.category || "").trim();
                                  return marketCategory === fc.id || marketCategory === fc.name;
                                });
                                setFilteredFancyMarketsData(filtered);
                              }}
                            >
                              <div>{fc.name}</div>
                          </span>
                          );
                      })}
                            

                    </div>
                  </TableCell>
                </TableRow>
                )}
              </TableHead>
              <TableBody>
                {(() => {
                  // When "All" is selected (tabVal === 0), show all data
                  // Otherwise, use filteredFancyMarketsData if available
                  let dataToDisplay: FancyMarketDTO[] = [];
                  
                  if (tabVal === 0) {
                    // "All" is selected - prefer parent fmData (refreshed every 3s) so digits/UI update
                    dataToDisplay = safeFmData.length > 0 ? safeFmData : fancyData;
                    console.log("[FMTable] 'All' selected - showing all data:", dataToDisplay.length);
                  } else {
                    // Category is selected - use filtered data (also prefer parent data source)
                    dataToDisplay = (filteredFancyMarketsData && filteredFancyMarketsData.length > 0)
                      ? filteredFancyMarketsData
                      : (safeFmData.length > 0 ? safeFmData : fancyData);
                    console.log("[FMTable] Category selected - showing filtered data:", dataToDisplay.length);
                  }

                  console.log("[FMTable] Render check - tabVal:", tabVal);
                  console.log("[FMTable] Render check - safeFmData.length:", safeFmData.length);
                  console.log("[FMTable] Render check - fancyData.length:", fancyData.length);
                  console.log("[FMTable] Render check - filteredFancyMarketsData.length:", filteredFancyMarketsData?.length || 0);
                  console.log("[FMTable] Render check - dataToDisplay.length:", dataToDisplay.length);
                   
                  if (dataToDisplay.length > 0) {
                    // Get unique categories from dataToDisplay
                    const uniqueCategories = Array.from(new Set(
                      dataToDisplay.map((fm) => String(fm.category || "").trim()).filter(Boolean)
                    ));
                    
                    console.log("[FMTable] Unique categories in dataToDisplay:", uniqueCategories);
                    console.log("[FMTable] fancyCategories:", fancyCategories);
                    console.log("[FMTable] dynamicCategoriesOrder:", dynamicCategoriesOrder);
                    
                    // Build category groups according to fancyCategories order
                    // First, create a map of categories from data
                    const categoryMap = new Map<string, any>();
                    uniqueCategories.forEach((catName) => {
                      // Find matching category from fancyCategories
                      const matchedCategory = fancyCategories.find((fc) => 
                        fc.name === catName || fc.id === catName || String(fc.id) === catName
                      );
                      
                      categoryMap.set(catName, {
                        fancyCategory: catName,
                        langKey: catName.toLowerCase().replace(/\s+/g, '_'),
                        label: matchedCategory?.name || catName,
                        order: matchedCategory ? fancyCategories.indexOf(matchedCategory) : 999, // Use index for ordering
                      });
                    });
                    
                    // Build category groups from data only (dynamic). Use API category order when available, else data order.
                    const categoryGroups =
                      fancyCategories.length > 0
                        ? fancyCategories
                            .map((fc) => {
                              const catName = uniqueCategories.find(
                                (cat) => cat === fc.name || cat === fc.id || cat === String(fc.id)
                              );
                              return catName && categoryMap.has(catName) ? categoryMap.get(catName) : null;
                            })
                            .filter(Boolean)
                            .concat(
                              uniqueCategories
                                .filter(
                                  (catName) =>
                                    !fancyCategories.some(
                                      (fc) =>
                                        catName === fc.name || catName === fc.id || catName === String(fc.id)
                                    )
                                )
                                .map((catName) => categoryMap.get(catName))
                                .filter(Boolean)
                            )
                        : uniqueCategories.map((catName) => categoryMap.get(catName)).filter(Boolean);
                    
                    return (
                      <>
                        {/* Render groups based on actual categories in data */}
                          {categoryGroups
                           .filter((group) => {
                             const hasData = dataToDisplay.some((fm) => {
                               const marketCategory = String(fm.category || "").trim();
                               return marketCategory === group.fancyCategory;
                             });
                             console.log(`[FMTable] Group ${group.fancyCategory} has data:`, hasData);
                             return hasData;
                           })
                          .map((group) => (
                            <React.Fragment key={group.fancyCategory}>
                            <Accordion
                              defaultExpanded={true}
                              className="markets-accordian"
                              style={{
                                position: "relative",
                              }}
                            >
                              <AccordionSummary
                                expandIcon={
                                  <ExpandLessSharpIcon className="expand-icon" />
                                }
                                aria-controls="panel1a-content"
                              >
                                <FancyHeaderRow
                                    groupName={langData?.[group.langKey] || group.label || group.fancyCategory}
                                />
                              </AccordionSummary>
                              <FancyHeaderRow
                                  groupName={langData?.[group.langKey] || group.label || group.fancyCategory}
                                className="row-hidden"
                              />
                                {(() => {
                                  // Filter markets by category
                                  const categoryMarkets = dataToDisplay.filter((fm) => {
                                    const marketCategory = String(fm.category || "").trim();
                                    return marketCategory === group.fancyCategory;
                                  });
                                  
                                  // Separate markets with and without series
                                  const marketsWithoutSeries: any[] = [];
                                  const seriesGroups: { [seriesName: string]: any[] } = {};
                                  
                                  categoryMarkets.forEach((fm) => {
                                    const seriesName = (fm as any).seriesName || "";
                                    if (seriesName && seriesName.trim() !== "") {
                                      // Has series - group by series
                                      if (!seriesGroups[seriesName]) {
                                        seriesGroups[seriesName] = [];
                                      }
                                      seriesGroups[seriesName].push(fm);
                                    } else {
                                      // No series - add to direct markets list
                                      marketsWithoutSeries.push(fm);
                                    }
                                  });
                                  
                                  // Sort markets without series
                                  const sortedMarketsWithoutSeries = marketsWithoutSeries.sort((a, b) => {
                                    if (a?.sort - b?.sort != 0) {
                                      return a?.sort - b?.sort;
                                    }
                                    const aDesc = a.marketName;
                                    const bDesc = b.marketName;
                                    if (aDesc > bDesc) return 1;
                                    else if (aDesc < bDesc) return -1;
                                    return 0;
                                  });
                                  
                                  // Get sorted series names
                                  const sortedSeriesNames = Object.keys(seriesGroups).sort();
                                  
                                  return (
                                    <>
                                      {/* First: Show markets without series directly */}
                                      {sortedMarketsWithoutSeries.map((fMarket, index) => {
                                        return !isFancyDisabled(fMarket.disable) ? (
                                          <React.Fragment key={`${group.fancyCategory}-no-series-${fMarket.marketId}-${index}`}>
                                      <FancyMarketRow
                                        eventData={eventData}
                                        fMarket={fMarket}
                                        index={index}
                                        cFactor={cFactor}
                                        loggedIn={loggedIn}
                                        openBets={openBets}
                                        disabledStatus={disabledStatus}
                                        addExchangeBet={addExchangeBet}
                                        setShowBooksModal={() => {
                                          setFancyBookOutcomeId(
                                            fMarket.marketId
                                          );
                                          setFancyBookOutcomeName(
                                            fMarket.marketName
                                          );
                                          setShowBooksModal(true);
                                        }}
                                        outcomeOpenBets={openBets.filter(
                                                (b) => {
                                                  const isFancyMarket = b.marketType === "FANCY" ||
                                                    (typeof b.marketType === "number" && b.marketType === 2);
                                                  return isFancyMarket && b.outcomeId === fMarket.marketId;
                                                }
                                        )}
                                        exposureMap={exposureMap}
                                        bets={bets}
                                        selectedRow={selectedRow}
                                        setSelectedRow={setSelectedRow}
                                        showActiveBook={hasFancyLiability(fMarket.marketId)}
                                        minStake={
                                          fMarket.isMarketLimitSet
                                            ? fMarket?.marketLimits?.minStake
                                              ? fMarket?.marketLimits?.minStake
                                              : marketLimits[fMarket?.marketId]
                                                  ?.minStake
                                            : fMarket.limits.minBetValue
                                        }
                                        maxStake={
                                          fMarket.isMarketLimitSet
                                            ? fMarket?.marketLimits?.maxStake
                                              ? fMarket?.marketLimits?.maxStake
                                              : marketLimits[fMarket?.marketId]
                                                  ?.maxStake
                                            : fMarket.limits.maxBetValue
                                        }
                                        oddLimit={
                                          fMarket?.marketLimits?.maxOdd?.toString()
                                            ? fMarket?.marketLimits?.maxOdd?.toString()
                                            : marketLimits[fMarket?.marketId]
                                                ?.maxOdd
                                        }
                                        commissionEnabled={commissionEnabled}
                                        fancySuspended={fancySuspended}
                                        fancyDisabled={fancyDisabled}
                                        setBetStartTime={(date) =>
                                          setBetStartTime(date)
                                        }
                                        setAddNewBet={(val) =>
                                          setAddNewBet(val)
                                        }
                                        oneClickBettingEnabled={
                                          oneClickBettingEnabled
                                        }
                                        setAlertMsg={setAlertMsg}
                                        langData={langData}
                                        oneClickBettingLoading={
                                          oneClickBettingLoading ||
                                          bettingInprogress
                                        }
                                        hasScrolledToBetslip={
                                          hasScrolledToBetslip
                                        }
                                        setHasScrolledToBetslip={
                                          setHasScrolledToBetslip
                                        }
                                      />
                                      {notifications.get(fMarket.marketId) ? (
                                        <TableRow>
                                          <TableCell colSpan={5} padding="none">
                                            <div
                                              className="marque-new"
                                              style={{
                                                animationDuration: `${Math.max(
                                                  10,
                                                  notifications.get(
                                                    fMarket.marketId
                                                  ).length / 5
                                                )}s`,
                                              }}
                                            >
                                              <div className="notifi-mssage">
                                                {notifications.get(
                                                  fMarket.marketId
                                                )}
                                              </div>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ) : null}
                                          </React.Fragment>
                                  ) : null;
                                      })}
                                      
                                      {/* Then: Show series groups at the bottom */}
                                      {sortedSeriesNames.map((seriesName) => {
                                        const seriesMarkets = seriesGroups[seriesName]
                                          .sort((a, b) => {
                                            if (a?.sort - b?.sort != 0) {
                                              return a?.sort - b?.sort;
                                            }
                                            const aDesc = a.marketName;
                                            const bDesc = b.marketName;
                                            if (aDesc > bDesc) return 1;
                                            else if (aDesc < bDesc) return -1;
                                            return 0;
                                          });
                                        
                                        return (
                                          <React.Fragment key={`${group.fancyCategory}-series-${seriesName}`}>
                                            <Accordion
                                              defaultExpanded={true}
                                              className="markets-accordian series-accordion"
                                              style={{
                                                position: "relative",
                                              }}
                                            >
                                              <AccordionSummary
                                                expandIcon={
                                                  <ExpandLessSharpIcon className="expand-icon" />
                                                }
                                                aria-controls="panel-series-content"
                                              >
                                                <FancyHeaderRow
                                                  groupName={seriesName}
                                                />
                                              </AccordionSummary>
                                              <FancyHeaderRow
                                                groupName={seriesName}
                                                className="row-hidden"
                                              />
                                              {seriesMarkets.map((fMarket, index) => {
                                                return !isFancyDisabled(fMarket.disable) ? (
                                                  <React.Fragment key={`${group.fancyCategory}-${seriesName}-${fMarket.marketId}-${index}`}>
                                                    <FancyMarketRow
                                                      eventData={eventData}
                                                      fMarket={fMarket}
                                                      index={index}
                                                      cFactor={cFactor}
                                                      loggedIn={loggedIn}
                                                      openBets={openBets}
                                                      disabledStatus={disabledStatus}
                                                      addExchangeBet={addExchangeBet}
                                                      setShowBooksModal={() => {
                                                        setFancyBookOutcomeId(
                                                          fMarket.marketId
                                                        );
                                                        setFancyBookOutcomeName(
                                                          fMarket.marketName
                                                        );
                                                        setShowBooksModal(true);
                                                      }}
                                                      outcomeOpenBets={openBets.filter(
                                                        (b) => {
                                                          const isFancyMarket = b.marketType === "FANCY" ||
                                                            (typeof b.marketType === "number" && b.marketType === 2);
                                                          return isFancyMarket && b.outcomeId === fMarket.marketId;
                                                        }
                                                      )}
                                                      exposureMap={exposureMap}
                                                      bets={bets}
                                                      selectedRow={selectedRow}
                                                      setSelectedRow={setSelectedRow}
                                                      showActiveBook={hasFancyLiability(fMarket.marketId)}
                                                      minStake={
                                                        fMarket.isMarketLimitSet
                                                          ? fMarket?.marketLimits?.minStake
                                                            ? fMarket?.marketLimits?.minStake
                                                            : marketLimits[fMarket?.marketId]
                                                              ?.minStake
                                                          : fMarket.limits.minBetValue
                                                      }
                                                      maxStake={
                                                        fMarket.isMarketLimitSet
                                                          ? fMarket?.marketLimits?.maxStake
                                                            ? fMarket?.marketLimits?.maxStake
                                                            : marketLimits[fMarket?.marketId]
                                                              ?.maxStake
                                                          : fMarket.limits.maxBetValue
                                                      }
                                                      oddLimit={
                                                        fMarket.isMarketLimitSet
                                                          ? fMarket?.marketLimits?.maxOdd
                                                            ? fMarket?.marketLimits?.maxOdd
                                                            : marketLimits[fMarket?.marketId]
                                                              ?.maxOdd
                                                          : fMarket.limits.oddsLimit || 4
                                                      }
                                                      commissionEnabled={fMarket.commissionEnabled}
                                                      fancySuspended={fancySuspended}
                                                      fancyDisabled={fancyDisabled}
                                                      setBetStartTime={setBetStartTime}
                                                      setAddNewBet={setAddNewBet}
                                                      oneClickBettingEnabled={oneClickBettingEnabled}
                                                      setAlertMsg={setAlertMsg}
                                                      langData={langData}
                                                      oneClickBettingLoading={oneClickBettingLoading || bettingInprogress}
                                                      hasScrolledToBetslip={hasScrolledToBetslip}
                                                      setHasScrolledToBetslip={setHasScrolledToBetslip}
                                                    />
                                                  </React.Fragment>
                                                ) : null;
                                              })}
                            </Accordion>
                                          </React.Fragment>
                                        );
                                      })}
                                    </>
                                  );
                                })()}
                            </Accordion>
                            </React.Fragment>
                    ))}
                  </>
                    );
                  } else {
                    return (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <div className="fm-table-msg-text">
                            {langData?.["fancy_markets_not_found_txt"] || "No Fancy Markets for this event"}
                            
                      </div>
                    </TableCell>
                  </TableRow>
                    );
                  }
                })()}
              </TableBody>
            </Table>
          </TableContainer>

          <Drawer
            anchor={"bottom"}
            open={infoDilalog.launch}
            onClose={() =>
              setInfoDialog({
                launch: false,
                oddsType: null,
                eventTypeID: null,
              })
            }
            className="light-bg-title game-rules-drawer web-view"
            title="Rules"
            // size="md"
          >
            <div className="game-rules-header">
              <div className="game-rules-title">{langData?.["game_rules"]}</div>
              <div
                className="game-rules-close cursor"
                onClick={() =>
                  setInfoDialog({
                    launch: false,
                    oddsType: null,
                    eventTypeID: null,
                  })
                }
              >
                <CloseOutlined />
              </div>
            </div>
            <MarketTermsCondi oddsType={infoDilalog.oddsType} />
          </Drawer>

          <Drawer
            anchor={"bottom"}
            open={infoDilalog.launch}
            onClose={() =>
              setInfoDialog({
                launch: false,
                oddsType: null,
                eventTypeID: null,
              })
            }
            className="light-bg-title game-rules-drawer mob-view"
            // TODO: check if this also needs to be changed ??
            title="Rules"
            // size="md"
          >
            <div className="game-rules-header">
              <div className="game-rules-title">{langData?.["game_rules"]}</div>
              <div
                className="game-rules-close cursor"
                onClick={() =>
                  setInfoDialog({
                    launch: false,
                    oddsType: null,
                    eventTypeID: null,
                  })
                }
              >
                <CloseOutlined />
              </div>
            </div>
            <MarketTermsCondi oddsType={infoDilalog.oddsType} />
          </Drawer>

          <Modal
            open={showBooksModal}
            closeHandler={() => {
              setShowBooksModal(false);
              setFancyBookOutcomeId(null);
            }}
            customClass="fancy-book-dialog"
            title="Book List"
            size="sm"
          >
            <FancyBookView
              fancyBookOutcomeId={fancyBookOutcomeId}
              exposureMap={
                exposureMap &&
                exposureMap &&
                exposureMap[`${fancyBookOutcomeId}:${fancyBookOutcomeName}`]
                  ? exposureMap[`${fancyBookOutcomeId}:${fancyBookOutcomeName}`]
                  : {}
              }
            />
          </Modal>
        </div>
      </div>
    </>
  );
};

type FancyHeaderRowProps = {
  groupName: string;
  className?: string;
};

const FancyHeaderRow: React.FC<FancyHeaderRowProps> = (props) => {
  const { groupName, className } = props;
  const tableFields = [
    {
      key: "groupName",
      Label: groupName,
      className: "market-name-cell-head",
      align: "left",
    },
    {
      key: "odds-no",
      Label: "",
      className: "odds-cell-head book-btn-cell",
      align: "center",
    },
    {
      key: "odds-no",
      Label: "No",
      className: "odds-cell-head odds-no-cell",
      align: "center",
    },
    {
      key: "odds-yes",
      Label: "Yes",
      className: "odds-cell-head odds-yes-cell",
      align: "center",
    },
    {
      key: "limits",
      Label: "",
      className: "odds-cell-head limits-cell",
      align: "center",
    },
  ];

  return (
    <TableRow className={"header-row " + className}>
      {tableFields.map((tF, index) => (
        <TableCell
          key={tF.key + index}
          align={tF.align === "left" ? "left" : "center"}
          className={tF.className}
        >
          {tF.key === "odds-no" ||
          tF.key === "odds-yes" ||
          tF.key === "groupName" ? (
            <div className={tF.key === "groupName" ? "groupname-cell" : tF.key.toLowerCase() + "-cell"}>
              {tF.key === "groupName" ? tF.Label : tF.Label?.toLowerCase()}
            </div>
          ) : null}
        </TableCell>
      ))}
    </TableRow>
  );
};

type FancyMarketRowProps = {
  eventData: EventDTO;
  fMarket: FancyMarketDTO;
  index: number;
  cFactor: number;
  loggedIn: boolean;
  disabledStatus: string[];
  addExchangeBet: (data: PlaceBetRequest) => void;
  setShowBooksModal: () => void;
  outcomeOpenBets: UserBet[];
  bets: PlaceBetRequest[];
  selectedRow: string;
  setSelectedRow: (data) => void;
  openBets: UserBet[];
  exposureMap: any;
  // fetchBetLimits: (mId, mcategory) => void;
  maxStake: number;
  minStake: number;
  oddLimit: string;
  commissionEnabled: boolean;
  fancySuspended: boolean;
  fancyDisabled: boolean;
  setBetStartTime: Function;
  setAddNewBet: Function;
  oneClickBettingEnabled: boolean;
  setAlertMsg: Function;
  oneClickBettingLoading: boolean;
  langData: any;
  hasScrolledToBetslip: boolean;
  setHasScrolledToBetslip: (value: boolean) => void;
  /** When true, show "Active Book" and enable book button (fancy present in getFancyLiability response) */
  showActiveBook?: boolean;
};

const FancyMarketRow: React.FC<FancyMarketRowProps> = (props) => {
  const {
    eventData,
    fMarket,
    index,
    cFactor,
    loggedIn,
    disabledStatus,
    addExchangeBet,
    setShowBooksModal,
    showActiveBook = false,
    setBetStartTime,
    bets,
    setAddNewBet,
    setSelectedRow,
    openBets,
    exposureMap,
    // fetchBetLimits,
    minStake,
    maxStake,
    oddLimit,
    commissionEnabled,
    fancySuspended,
    langData,
    fancyDisabled,
    oneClickBettingEnabled,
    setAlertMsg,
    oneClickBettingLoading,
    hasScrolledToBetslip,
    setHasScrolledToBetslip,
  } = props;

  // useEffect(() => {
  //   if (fMarket) {
  //     fetchBetLimits(fMarket.marketId, fMarket.category);
  //   }
  // }, [loggedIn]);

  // useEffect(() => {
  //   if (fMarket) {
  //     const interval = setInterval(() => {
  //       console.log("fmarket: ", fMarket)

  //       fetchBetLimits(fMarket.marketId, fMarket.category);
  //     }, 5000);
  //     return () => clearInterval(interval);
  //   }
  // }, [fMarket.marketId]);

  const isFancySuspended = (fMarketSuspended: boolean) => {
    return fancySuspended === true ? true : fMarketSuspended;
  };

  const isFancyDisabled = (fMarketDisabled: boolean) => {
    return fancyDisabled ? true : fMarketDisabled;
  };

  return (
    <>
      <TableRow key={"row-" + index}>
        <TableCell className="market-name-cell" key={"row-" + index + "cell-1"}>
          <div className="market">
            {fMarket.customMarketName
              ? fMarket.customMarketName
              : fMarket.marketName}{" "}
            {fMarket.commissionEnabled
              ? // && commissionEnabled
                "*"
              : null}
          </div>
        </TableCell>
        <TableCell
          className="odds-cell book-btn-cell"
          key={"row-" + index + "cell-4"}
        >
          <Button
            className="fancy-book-btn"
            onClick={() => {
              if (showActiveBook || (exposureMap && exposureMap[`${fMarket.marketId}:${fMarket.marketName}`]))
                setShowBooksModal();
            }}
            disabled={!showActiveBook && !(exposureMap && exposureMap[`${fMarket.marketId}:${fMarket.marketName}`])}
          >
            {showActiveBook ? (langData?.["active_book"] || "Book") : (langData?.["book"] || "Book")}
          </Button>
        </TableCell>
        <TableCell className="odds-cell" key={"row-" + index + "cell-2"}>
          <div className="odds-block">
            <ExchOddBtn
              mainValue={fMarket.layPrice}
              mainValueClass="runs"
              subValue={fMarket.laySize}
              subValueClass="odds"
              oddType="odds-no-cell"
              valueType="fancyMarketOdds"
              disable={
                disabledStatus.includes(fMarket.status.toLowerCase()) ||
                isFancySuspended(fMarket.suspend) === true ||
                isFancyDisabled(fMarket.disable) === true
              }
              onClick={() => {
                if (oneClickBettingLoading) {
                  setAlertMsg({
                    message: langData?.betIsInProgress,
                    type: "error",
                  });
                  return;
                }
                if (
                  !disabledStatus.includes(fMarket.status.toLowerCase()) ||
                  isFancySuspended(fMarket.suspend) === true ||
                  isFancyDisabled(fMarket.disable) === true
                ) {
                  const betData: PlaceBetRequest = {
                    providerId: eventData.fancyProvider,
                    sportId: eventData.sportId,
                    seriesId: eventData.competitionId,
                    seriesName: eventData.competitionName,
                    eventId: eventData.eventId,
                    eventName: eventData.eventName,
                    eventDate: eventData.openDate ? (typeof eventData.openDate === "string" ? eventData.openDate : new Date(eventData.openDate).toISOString()) : "",
                    marketId: fMarket.marketId,
                    marketName: fMarket.marketName,
                    marketType: "FANCY" as const,
                    outcomeId: fMarket.marketId,
                    outcomeDesc: "@ " + fMarket.layPrice,
                    betType: "LAY",
                    amount: 0,
                    oddValue: fMarket.laySize,
                    sessionPrice: fMarket.layPrice,
                    oddLimt: oddLimit,
                    minStake: minStake,
                    maxStake: maxStake,
                    mcategory: fMarket.category,
                    displayOddValue: fMarket.layPrice,
                    delay: fMarket?.marketLimits?.delay || 0,
                  };

                  if (oneClickBettingEnabled) {
                    addExchangeBet(betData);
                    oneClickBetPlaceHandler(
                      [betData],
                      langData,
                      setAlertMsg,
                      eventData
                    );
                  } else {
                    setSelectedRow(fMarket.marketName + "FM");
                    addExchangeBet(betData);
                  }
                }
              }}
            />
          </div>
        </TableCell>

        <TableCell className="odds-cell" key={"row-" + index + "cell-3"}>
          <div className="odds-block">
            <ExchOddBtn
              mainValue={fMarket.backPrice}
              mainValueClass="runs"
              subValue={fMarket.backSize}
              subValueClass="odds"
              oddType="odds-yes-cell"
              valueType="fancyMarketOdds"
              disable={
                disabledStatus.includes(fMarket.status.toLowerCase()) ||
                isFancySuspended(fMarket.suspend) === true ||
                isFancyDisabled(fMarket.disable) === true
              }
              onClick={() => {
                if (oneClickBettingLoading) {
                  setAlertMsg({
                    message: langData?.betIsInProgress,
                    type: "error",
                  });
                  return;
                }
                if (
                  !disabledStatus.includes(fMarket.status.toLowerCase()) ||
                  isFancySuspended(fMarket.suspend) === true ||
                  isFancyDisabled(fMarket.disable) === true
                ) {
                  const betData: PlaceBetRequest = {
                    providerId: eventData.fancyProvider,
                    sportId: eventData.sportId,
                    seriesId: eventData.competitionId,
                    seriesName: eventData.competitionName,
                    eventId: eventData.eventId,
                    eventName: eventData.eventName,
                    eventDate: eventData.openDate ? (typeof eventData.openDate === "string" ? eventData.openDate : new Date(eventData.openDate).toISOString()) : "",
                    marketId: fMarket.marketId,
                    marketName: fMarket.marketName,
                    marketType: "FANCY" as const,
                    outcomeId: fMarket.marketId,
                    outcomeDesc: "@ " + fMarket.backPrice,
                    betType: "BACK",
                    amount: 0,
                    oddValue: fMarket.backSize,
                    sessionPrice: fMarket.backPrice,
                    oddLimt: oddLimit,
                    minStake: minStake,
                    maxStake: maxStake,
                    mcategory: fMarket.category,
                    displayOddValue: fMarket.backPrice,
                    delay: fMarket?.marketLimits?.delay || 0,
                  };

                  if (oneClickBettingEnabled) {
                    addExchangeBet(betData);
                    oneClickBetPlaceHandler(
                      [betData],
                      langData,
                      setAlertMsg,
                      eventData
                    );
                  } else {
                    setSelectedRow(fMarket.marketName + "FM");
                    addExchangeBet(betData);
                  }
                }
              }}
            />
          </div>
        </TableCell>

        <TableCell className="limits-cell">
          <div className="limits-data">
            <div className="row web-view">
              <div>
                {langData?.["min"]}:{" "}
                {(() => {
                  if (!minStake || !cFactor || cFactor === 0) return 0;
                  const result = minStake / cFactor;
                  return isNaN(result) || !isFinite(result) ? 0 : ThousandFormatter(result);
                })()}
              </div>
              <div>
                {langData?.["max"]}:{" "}
                {(() => {
                  if (!maxStake || !cFactor || cFactor === 0) return 0;
                  const result = maxStake / cFactor;
                  if (isNaN(result) || !isFinite(result)) return 0;
                  return maxStake % 1000 === 0
                    ? ThousandFormatter(result)
                    : result;
                })()}
              </div>
            </div>
            <div className="row mob-view">
              <div>
                {langData?.["min"]}:{" "}
                {(() => {
                  if (!minStake || !cFactor || cFactor === 0) return 0;
                  const result = minStake / cFactor;
                  return isNaN(result) || !isFinite(result) ? 0 : ThousandFormatter(result);
                })()}
              </div>{" "}
              <div>
                {" "}
                {langData?.["max"]}:{" "}
                {(() => {
                  if (!maxStake || !cFactor || cFactor === 0) return 0;
                  const result = maxStake / cFactor;
                  if (isNaN(result) || !isFinite(result)) return 0;
                  return maxStake % 1000 === 0
                    ? ThousandFormatter(result)
                    : result;
                })()}
              </div>
            </div>
            {/* <div className="row"></div> */}
          </div>
        </TableCell>
        {disabledStatus.includes(fMarket.status.toLowerCase()) ||
        isFancySuspended(fMarket.suspend) === true ||
        isFancyDisabled(fMarket.disable) === true ? (
          <TableCell key={"row-" + index + "cell-5"}>
            <div className="disabled-odds-cell">
              {fMarket.status.toLowerCase().includes("suspended") ||
              isFancySuspended(fMarket.suspend) === true ||
              isFancyDisabled(fMarket.disable) === true
                ? "SUSPENDED"
                : fMarket.status.replace("_", " ")}
            </div>
          </TableCell>
        ) : null}
      </TableRow>
      {!oneClickBettingEnabled &&
      bets?.length > 0 &&
      bets?.[0]?.marketName === fMarket?.marketName &&
      bets?.[0]?.marketId === fMarket?.marketId &&
      isMobile ? (
        <TableRow
          className="inline-betslip"
          ref={(el) => {
            if (el && !hasScrolledToBetslip) {
              // Scroll to the betslip with smooth behavior only once
              setHasScrolledToBetslip(true);
              setTimeout(() => {
                el.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "nearest",
                });
              }, 100);
            }
          }}
        >
          <TableCell colSpan={12}>
            {" "}
            <ExchBetslip
              setBetStartTime={(date) => setBetStartTime(date)}
              setAddNewBet={(val) => setAddNewBet(val)}
            />{" "}
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
};

const mapStateToProps = (state: RootState, ownProps?: Partial<StoreProps>) => {
  const eventType = state.exchangeSports.selectedEventType;
  const competition = state.exchangeSports.selectedCompetition;
  const event = state.exchangeSports.selectedEvent;
  
  // Use eventData from props if provided, otherwise get from Redux state
  const reduxEventData = getAllMarketsByEvent(
      state.exchangeSports.events,
    eventType?.id || "",
    competition?.id || "",
    event?.id || ""
  );
  
  console.log("[FMTable mapStateToProps] ownProps?.eventData:", ownProps?.eventData);
  console.log("[FMTable mapStateToProps] reduxEventData:", reduxEventData);
  
  return {
    eventData: ownProps?.eventData || reduxEventData,
    // Only dynamic data from parent (getFancies API); no Redux/static fallback
    fmData: ownProps?.fmData ?? [],
    fancySuspended: isFancyMarketSuspended(
      state.exchangeSports.secondaryMarketsMap,
      event?.id || ""
    ),
    fancyDisabled: isFancyMarketDisabled(
      state.exchangeSports.secondaryMarketsMap,
      event?.id || ""
    ),
    bets: state.exchBetslip.bets,
    openBets: state.exchBetslip.openBets,
    commissionEnabled: state.common.commissionEnabled,
    langData: state.common.langData,
    bettingInprogress: state.exchBetslip.bettingInprogress,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    addExchangeBet: (data: PlaceBetRequest) => dispatch(addExchangeBet(data)),
    setAlertMsg: (alert: AlertDTO) => dispatch(setAlertMsg(alert)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FMTable);
