import React from "react";
import Details, { MPTabs } from "./MyProfileComponents/Components";
import "./MyProfileSideBar.scss";
import { demoUser, demoUserPrefix } from "../../../util/stringUtil";

type Props = {
  className?: string;
  onSelect: Function;
  tabValue: number;
  langData: any;
};

const MyProfileSideBar = (props: Props) => {
  const { className, onSelect, tabValue, langData } = props;

  return (
    // 'mp' in class name means my profile
    <aside className={`mp-side-bar ${className ? className : ""}`}>
      <div className="mp-username">
        <div className="white-circle"></div>
        <div className="mp-username-sub">
          {demoUser()
            ? langData?.["demo_user"]
            : sessionStorage.getItem("username")}
        </div>
      </div>
      <Details langData={langData} />
      <MPTabs
        onChange={(label) => {
          onSelect(label);
        }}
        tabValue={tabValue}
        langData={langData}
      />
    </aside>
  );
};

export default MyProfileSideBar;
