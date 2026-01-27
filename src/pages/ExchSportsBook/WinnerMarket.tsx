import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@material-ui/core';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import ExchBetslip from '../../components/ExchBetslip/ExchBetslip';
import ExpandLessSharpIcon from '@material-ui/icons/ExpandLessSharp';
import {
  MatchOddsDTO,
  MatchOddsRunnerDTO,
} from '../../models/common/MatchOddsDTO';
import { EventDTO } from '../../models/common/EventDTO';
import { PlaceBetRequest } from '../../models/BsData';
import ExchOddBtn from '../../components/ExchOddButton/ExchOddButton';
import { getCurrencyTypeFromToken } from '../../store';
import { CURRENCY_TYPE_FACTOR } from '../../constants/CurrencyTypeFactor';
import { connect, useSelector } from 'react-redux';
import { RootState } from '../../models/RootState';
import { ThousandFormatter } from '../../util/stringUtil';
import { MarketNotification } from '../../models/ExchangeSportsState';
import { oneClickBetPlaceHandler } from '../../store/exchBetslip/exchBetslipActions';
import { OneClickBettingCountdown } from '../../components/OneClickBetting/OneClickCountdown';
import { setAlertMsg } from '../../store/common/commonActions';
import { AlertDTO } from '../../models/Alert';
import '../../components/PremiumMarkets/PremiumMarkets.scss';

interface WinnerMarketDTO {
  winnerMarket: MatchOddsDTO;
  addExchangeBet: Function;
  eventData: EventDTO;
  setStartTime: Function;
  setAddNewBet: Function;
  bets: PlaceBetRequest[];
  exposureMap: any;
  setAlertMsg: Function;
  langData: any;
  marketNotifications: MarketNotification[];
  bettingInprogress: boolean;
}

const WinnerMarket: React.FC<WinnerMarketDTO> = (props) => {
  const {
    winnerMarket,
    addExchangeBet,
    eventData,
    setStartTime,
    setAddNewBet,
    bets,
    exposureMap,
    setAlertMsg,
    langData,
    marketNotifications,
    bettingInprogress,
  } = props;

  const {
    oneClickBettingEnabled,
    oneClickBettingStake,
    oneClickBettingLoading,
  } = useSelector((state: RootState) => state.exchBetslip);
  const disabledStatus = ['suspended', 'closed', 'suspended-manually'];
  const [notifications, setNotifications] = useState<Map<String, string>>(
    new Map()
  );
  // const {} = useSelector((state: RootState) => state.)
  const [cFactor, setCFactor] = useState<number>(
    CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()]
  );
  const [hasScrolledToBetslip, setHasScrolledToBetslip] =
    useState<boolean>(false);

  // Reset scroll state when bets change
  useEffect(() => {
    setHasScrolledToBetslip(false);
  }, [bets]);

  const isOddDisable = (
    eventData: EventDTO,
    status: string,
    suspend: boolean,
    betType: string,
    odd: number,
    marketTime?: Date
  ) => {
    if (disabledStatus.includes(status.toLowerCase()) || suspend === true)
      return true;

    if (winnerMarket?.marketLimits?.maxOdd < odd) return true;

    // WORLD CUP
    if (winnerMarket?.marketName.toLowerCase().includes('winner')) return false;

    if (['7', '4339'].includes(eventData.sportId)) {
      if (betType === 'lay') return true;

      let duration = moment.duration(moment(marketTime).diff(moment()));
      return duration.asMinutes() < 10 && duration.asMinutes() > 0
        ? false
        : true;
    }

    //IPl matches
    if (eventData.competitionId === '101480') {
      if (moment(eventData.openDate).diff(moment(), 'minutes') < 15) {
        return false;
      }
    }

    return eventData?.status === 'IN_PLAY' ? false : true;
  };

  const getTotalPL = (
    marketId: string,
    marketName: string,
    runner: MatchOddsRunnerDTO
  ) => {
    let returns = null;
    const mBetslipBets = bets.filter(
      (b) =>
        // (b.marketName === 'Match Odds' || b.marketName === 'Goal Markets') &&
        b.marketId === marketId && b.amount && b.amount > 0
    );

    if (mBetslipBets.length > 0) {
      returns = getOpenBetsPL(marketId, marketName, runner);
      for (let bet of mBetslipBets) {
        const plVal = bet.oddValue * bet.amount - bet.amount;
        if (bet.betType === 'BACK') {
          if (bet.outcomeId === runner.runnerId) {
            returns ? (returns += plVal) : (returns = plVal);
          } else {
            returns ? (returns -= bet.amount) : (returns = 0 - bet.amount);
          }
        } else if (bet.betType === 'LAY') {
          if (bet.outcomeId !== runner.runnerId) {
            returns ? (returns += bet.amount) : (returns = bet.amount);
          } else {
            returns ? (returns -= plVal) : (returns = 0 - plVal);
          }
        }
      }
    }
    return [returns];
  };

  const getOpenBetsPL = (
    marketId: string,
    marketName: string,
    runner: MatchOddsRunnerDTO
  ) => {
    let returns = null;

    if (exposureMap && exposureMap?.[`${marketId}:${marketName}`]) {
      for (let rn of exposureMap[`${marketId}:${marketName}`]) {
        if (rn.runnerId === runner.runnerId) {
          return rn?.userRisk / cFactor;
        }
      }
    }
  };

  const getOpenBetsPLInArray = (
    marketId: string,
    marketName: string,
    runner: MatchOddsRunnerDTO
  ) => {
    let pl = getOpenBetsPL(marketId, marketName, runner);
    return pl ? [pl] : [];
  };

  useEffect(() => {
    if (marketNotifications) {
      const map = new Map();
      marketNotifications?.forEach((msgObj) => {
        map.set(msgObj?.marketId, msgObj?.message);
      });
      setNotifications(map);
    }
  }, [marketNotifications]);

  return (
    <div className="who-win-ctn">
      <div className="premium-markets-table-ctn">
        <div className="pm-table-content">
          <Accordion
            defaultExpanded={true}
            className="markets-accordian"
            style={oneClickBettingLoading ? { padding: '10px 0' } : {}}
          >
            <AccordionSummary
              expandIcon={<ExpandLessSharpIcon className="expand-icon" />}
              aria-controls="panel1a-content"
            >
              <div className="winner-market">
                <div className="market-name">{winnerMarket?.marketName}</div>
                <span className="bet-limits-section winner-mkt-limits">
                  <div className="winner-mkt-limit">
                    {langData?.['min']}:
                    {ThousandFormatter(
                      winnerMarket?.marketLimits
                        ? winnerMarket?.marketLimits.minStake / cFactor
                        : 100
                    )}{' '}
                  </div>
                  <div className="winner-mkt-limit">
                    {langData?.['max']}:
                    {winnerMarket?.marketLimits?.maxStake % 1000 === 0
                      ? ThousandFormatter(
                          winnerMarket?.marketLimits
                            ? winnerMarket?.marketLimits.maxStake / cFactor
                            : 5000
                        )
                      : winnerMarket?.marketLimits
                        ? winnerMarket?.marketLimits.maxStake / cFactor
                        : 5000}
                  </div>
                </span>
              </div>
            </AccordionSummary>

            <AccordionDetails>
              <TableContainer>
                <Table className="pm-table">
                  <TableBody>
                    {(oneClickBettingLoading || bettingInprogress) &&
                      bets?.[0]?.marketType === 'MO' &&
                      bets?.[0]?.marketName === winnerMarket?.marketName &&
                      bets?.[0]?.marketId === winnerMarket?.marketId && (
                        <TableRow>
                          <TableCell colSpan={2} padding="none">
                            <OneClickBettingCountdown
                              delay={bets?.[0]?.delay || 0}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    {winnerMarket?.runners?.map((runner) => (
                      <>
                        <TableRow>
                          <TableCell className="team-name-cell">
                            <div
                              className="team"
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '4px',
                              }}
                            >
                              {runner?.runnerName}
                              {getOpenBetsPLInArray(
                                winnerMarket.marketId,
                                winnerMarket.marketName,
                                runner
                              )?.map((ret) =>
                                ret !== null ? (
                                  <span
                                    className={ret >= 0 ? 'profit' : 'loss'}
                                  >
                                    {ret > 0
                                      ? '+' + Number(ret).toFixed(2)
                                      : Number(ret).toFixed(2)}
                                  </span>
                                ) : null
                              )}
                            </div>

                            {getTotalPL(
                              winnerMarket.marketId,
                              winnerMarket.marketName,
                              runner
                            ).map((ret) =>
                              ret !== null ? (
                                <div className="profit-loss-box">
                                  <span
                                    className={ret >= 0 ? 'profit' : 'loss'}
                                  >
                                    {ret > 0
                                      ? '+' + Number(ret).toFixed(2)
                                      : Number(ret).toFixed(2)}
                                  </span>
                                </div>
                              ) : null
                            )}
                          </TableCell>
                          <TableCell className="odds-cell" align="right">
                            <div className="odds-block who-win-odds ">
                              <ExchOddBtn
                                mainValue={runner.backPrices[0]?.price}
                                subValue={runner.backPrices[0]?.size}
                                showSubValueinKformat={true}
                                oddType="premium-odd"
                                valueType="matchOdds"
                                disable={isOddDisable(
                                  eventData,
                                  winnerMarket.status.toLowerCase(),
                                  winnerMarket.suspend,
                                  'back',
                                  runner.backPrices[0]?.price,
                                  winnerMarket.marketTime
                                )}
                                onClick={() => {
                                  if (
                                    oneClickBettingLoading ||
                                    bettingInprogress
                                  ) {
                                    setAlertMsg({
                                      message: langData?.betIsInProgress,
                                      type: 'error',
                                    });
                                    return;
                                  }
                                  if (
                                    moment(eventData?.openDate).diff(
                                      moment(),
                                      'hour'
                                    ) <= 24 ||
                                    eventData?.status === 'IN_PLAY' ||
                                    disabledStatus.includes(
                                      winnerMarket.status.toLowerCase()
                                    ) ||
                                    winnerMarket.suspend === true ||
                                    !['7', '4339'].includes(eventData.sportId)
                                  ) {
                                    const betData: PlaceBetRequest = {
                                      providerId: eventData.providerName,
                                      sportId: eventData.sportId,
                                      seriesId: eventData.competitionId,
                                      seriesName: eventData.competitionName,
                                      eventId: eventData.eventId,
                                      eventName: eventData.eventName,
                                      eventDate: eventData.openDate,
                                      marketId: winnerMarket.marketId,
                                      marketName: winnerMarket.marketName,
                                      marketType: 'MO',
                                      outcomeId: runner.runnerId,
                                      outcomeDesc: runner.runnerName,
                                      betType: 'BACK',
                                      amount: 0,
                                      oddValue: runner.backPrices[0].price,
                                      oddSize: runner.backPrices[0].size,
                                      sessionPrice: -1,
                                      srEventId: eventData.eventId,
                                      srSeriesId: eventData.competitionId,
                                      srSportId: eventData.sportId,
                                      minStake: winnerMarket.limits.minBetValue,
                                      maxStake: winnerMarket.limits.maxBetValue,
                                      oddLimt:
                                        winnerMarket?.marketLimits?.maxOdd.toString(),
                                      mcategory: 'ALL',
                                      delay:
                                        winnerMarket?.marketLimits?.delay || 0,
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
                                      addExchangeBet(betData);
                                    }
                                  }
                                }}
                              />
                            </div>
                          </TableCell>
                        </TableRow>

                        {!oneClickBettingEnabled &&
                        bets?.length > 0 &&
                        bets?.[0]?.marketName === winnerMarket?.marketName &&
                        bets?.[0]?.marketId === winnerMarket?.marketId &&
                        bets?.[0]?.outcomeId === runner.runnerId &&
                        isMobile ? (
                          <TableRow
                            className="inline-betslip"
                            ref={(el) => {
                              if (el && !hasScrolledToBetslip) {
                                // Scroll to the betslip with smooth behavior only once
                                setHasScrolledToBetslip(true);
                                setTimeout(() => {
                                  el.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center',
                                    inline: 'nearest',
                                  });
                                }, 100);
                              }
                            }}
                          >
                            <TableCell colSpan={3}>
                              {' '}
                              <ExchBetslip
                                setBetStartTime={(date) => setStartTime(date)}
                                setAddNewBet={(val) => setAddNewBet(val)}
                              />{' '}
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </>
                    ))}
                  </TableBody>
                  {notifications?.get(winnerMarket?.marketId) ? (
                    <TableRow
                      style={{
                        background: 'var(--market-table-bg) !important',
                        borderRadius: '20px !important',
                      }}
                    >
                      <TableCell colSpan={3} padding="none" className="br-20">
                        <div
                          className="marque-new"
                          style={{
                            animationDuration: `${Math.max(
                              10,
                              notifications?.get(winnerMarket?.marketId)
                                .length / 5
                            )}s`,
                          }}
                        >
                          <div className="notifi-mssage">
                            {notifications?.get(winnerMarket?.marketId)}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    langData: state.common.langData,
    bettingInprogress: state.exchBetslip.bettingInprogress,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setAlertMsg: (alert: AlertDTO) => dispatch(setAlertMsg(alert)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WinnerMarket);
