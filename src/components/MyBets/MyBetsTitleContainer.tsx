import React from "react";
import "./MyBetsTitleHeader.scss";

const AppTitleHeader = (props: {
  title: string;
  icon: any;
  body?: JSX.Element;
}) => {
  const { body, icon, title } = props;
  return (
    <>
      {body ? (
        <div className="title-header-support-container">
          <div className="container">
            <div className="title-container">
              <div className="title-container-icon">
                <props.icon className="title-img" />
              </div>
              <p className="title">{title}</p>
            </div>
            <div className="my-bets-body-ctn">{body}</div>
          </div>
        </div>
      ) : (
        <div className="container">
          <div className="title-container">
            <div className="title-container-icon">
              <props.icon className="title-img" />
            </div>
            <p className="title">{title}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AppTitleHeader;
