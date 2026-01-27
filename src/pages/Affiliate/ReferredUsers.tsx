import React from "react";
import CustomTable from "../../common/CustomTable/CustomTable";
import CustomTableMob, {
  HeaderParamsType,
} from "../../common/CustomTableMob/CustomTableMob";

const headerParams: HeaderParamsType[] = [
  {
    label: "USERNAME",
    langKey: "username_caps",
    param: "",
    widthInPercent: 16.6,
  },
  {
    label: "REGISTERED",
    langKey: "registered_caps",
    param: "",
    widthInPercent: 16.6,
  },
  {
    label: "TOTAL DEPOSIT",
    langKey: "total_deposit_caps",
    param: "",
    widthInPercent: 16.6,
  },
  {
    label: "LAST DEPOSIT",
    langKey: "last_deposit_caps",
    param: "",
    widthInPercent: 16.6,
  },
  {
    label: "WAGERED",
    langKey: "wagered_caps",
    param: "",
    widthInPercent: 16.6,
  },
  {
    label: "COMMISSION",
    langKey: "commission_caps",
    param: "",
    widthInPercent: 16.6,
  },
];

const mobHeaderParams: HeaderParamsType[] = [
  {
    label: "USERNAME",
    langKey: "username_caps",
    param: "",
    widthInPercent: 33.3,
  },
  {
    label: "REGISTERED",
    langKey: "registered_caps",
    param: "",
    widthInPercent: 33.3,
  },

  {
    label: "WAGERED",
    langKey: "wagered_caps",
    param: "",
    widthInPercent: 33.3,
  },
];

type Props = {
  langData: any;
};

const ReferredUsers = (props: Props) => {
  const { langData } = props;

  return (
    <div>
      <CustomTable
        className="web-view"
        headerParams={headerParams}
        bodyData={[]}
        noDataMessage={langData?.["data_not_available_txt"]}
        langData={langData}
      />

      <CustomTableMob
        headerParams={mobHeaderParams}
        bodyData={[]}
        upperRow={[]}
        lowerRow={[]}
        noDataMessage={langData?.["data_not_available_txt"]}
        langData={langData}
      />
    </div>
  );
};

export default ReferredUsers;
