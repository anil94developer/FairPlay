import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@material-ui/core";
import { SportIdByName } from "../../util/stringUtil";
import { connect, useDispatch, useSelector } from "react-redux";
import { RootState } from "../../models/RootState";
import "./Exposure.scss";
import { useHistory } from "react-router";
import { eventTypesNameMap } from "../../store/exchangeSports/exchangeSportsSelectors";
import { setCompetition, setEventType, setExchEvent } from "../../store";
import REPORTING_API from "../../reporting-api";

interface ExpDTO {
  eventId: string;
  sportId: string;
  competitionId: string;
  eventName: string;
  competitionName: string;
  exposure: number;
}

interface ExposureTableProps {
  exposure: number;
  setShowExpDetail: Function;
  langData: any;
}

const ExposureTable: React.FC<ExposureTableProps> = ({
  exposure,
  setShowExpDetail,
  langData,
}) => {
  const [expData, setExpData] = useState<ExpDTO[]>();
  const [totalExp, setTotalExp] = useState<number>(0);
  const history = useHistory();
  const dispatch = useDispatch();

  const handleEventChange = (event: ExpDTO) => {
    const competitionSlug = event.competitionName
      ? event.competitionName
          .toLocaleLowerCase()
          .replace(/[^a-z0-9]/g, " ")
          .replace(/ +/g, " ")
          .trim()
          .split(" ")
          .join("-")
      : "league";

    let eventSlug = event.eventName
      ? event.eventName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, " ")
          .replace(/ +/g, " ")
          .trim()
          .split(" ")
          .join("-")
      : "";

    dispatch(
      setEventType({
        id: event.sportId,
        name: SportIdByName[event.sportId],
        slug: eventTypesNameMap[event.sportId],
      })
    );
    dispatch(
      setCompetition({
        id: event.competitionId,
        name: event.competitionName,
        slug: competitionSlug,
      })
    );
    dispatch(
      setExchEvent({
        id: event.eventId,
        name: event.eventName,
        slug: eventSlug,
      })
    );

    history.push(
      `/exchange_sports/${
        eventTypesNameMap[event.sportId]
      }/${competitionSlug}/${eventSlug}/${btoa(
        `BetFair:${event.sportId}:${event.competitionId}:${event.eventId}`
      )}`
    );

    setShowExpDetail(false);
  };

  const fetchExposureData = async () => {
    try {
      const response = await REPORTING_API.get(
        "/reports/v2/risk-management/event-risk",
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );
      console.log(response.data);
      setExpData(response.data);

      if (response.data?.length > 0) {
        let sum = 0;
        for (let i = 0; i < response?.data?.length; i++) {
          sum += response?.data[i]?.exposure;
        }
        setTotalExp(sum);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchExposureData();
  }, []);

  return (
    <TableContainer>
      <Table className="exposure-table">
        <TableHead>
          <TableRow>
            <TableCell>{langData?.["event_type"]}</TableCell>
            <TableCell>{langData?.["event_name"]}</TableCell>
            <TableCell>{langData?.["expose"]}</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {expData?.map((row) => (
            <TableRow>
              <TableCell>{SportIdByName[row.sportId]}</TableCell>
              <TableCell>
                <button
                  className="exp-btn"
                  onClick={() => handleEventChange(row)}
                >
                  {row.eventName}
                </button>
              </TableCell>
              <TableCell>{row.exposure}</TableCell>
            </TableRow>
          ))}
          {exposure !== totalExp ? (
            <TableRow>
              <TableCell>{langData?.["others"]}</TableCell>
              <TableCell></TableCell>
              <TableCell>{-(exposure + totalExp).toFixed(2)}</TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    exposure: state.auth.balanceSummary.exposure || 0,
  };
};

export default connect(mapStateToProps, null)(ExposureTable);
