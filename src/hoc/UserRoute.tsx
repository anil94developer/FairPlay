import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { RootState } from "../models/RootState";

type PrivateRouteProps = {
  component: React.FC;
  exact: boolean;
  loggedIn: boolean;
  path: string;
  permissions: number;
  role: string;
};

const UserRoute: React.FC<PrivateRouteProps> = (props) => {
  const { component, exact, loggedIn, path, permissions, role } = props;
  if (loggedIn) {
    return (permissions & 2) !== 0 ? (
      <Redirect to="/house" />
    ) : role && role !== "User" ? (
      <Redirect to="/admin" />
    ) : (
      <Route component={component} path={path} exact={exact} />
    );
  } else {
    return <Redirect to="/" />;
  }
};

const mapStateToProps = (state: RootState) => {
  if (!state.auth.loggedIn) {
    return {
      permissions: 0,
      role: null,
    };
  }
  
  let permission = 0;
  let role = null;
  
  try {
    let claim = state.auth?.jwtToken?.split(".")?.[1] || "";
    if (claim) {
      const decodedClaim = window.atob(claim);
      if (decodedClaim) {
        const parsedClaim = JSON.parse(decodedClaim);
        permission = parsedClaim?.perm || 0;
        role = parsedClaim?.role || null;
      }
    }
  } catch (error) {
    console.error("[UserRoute] Error parsing JWT token:", error);
    // Return default values if parsing fails
    permission = 0;
    role = null;
  }
  
  return {
    loggedIn: state.auth.loggedIn,
    permissions: permission,
    role: role,
  };
};

export default connect(mapStateToProps, null)(UserRoute);
