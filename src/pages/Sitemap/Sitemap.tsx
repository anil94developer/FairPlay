import React from "react";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import {
  EXCHANGE_EVENT_TYPES,
  EXCH_SPORTS_MAP,
} from "../../constants/ExchangeEventTypes";
import { RootState } from "../../models/RootState";
import "./Sitemap.scss";

type Sitemap = {};

const Sitemap: React.FC<Sitemap> = (props) => {
  const excheventsList = EXCHANGE_EVENT_TYPES;

  return (
    <>
      <div className="sitemap-ctn">
        <div className="sports-betting-ctn">
          <div className="sitemap-title">Sports Betting</div>
          <div className="sports-cards">
            {excheventsList.map((et, idx) =>
              EXCH_SPORTS_MAP[et.slug] !== 0 ? (
                <NavLink
                  key={et.slug + idx}
                  activeClassName="active-link"
                  exact={true}
                  to={"/exchange_sports/" + et.slug}
                  className="sport-card"
                >
                  {et.name}
                </NavLink>
              ) : null
            )}
          </div>
        </div>
        <div className="company-info-ctn">
          <div className="sitemap-title">Casinos</div>
          <div className="sports-cards">
            <NavLink to="/casino" className="sport-card">
              Live Casino
            </NavLink>
            <NavLink to="/indian_casino" className="sport-card">
              Indian Casino
            </NavLink>
            <NavLink to="/virtual_sports" className="sport-card">
              Virtual Sports
            </NavLink>
          </div>
        </div>
        <div className="company-info-ctn">
          <div className="sitemap-title">Company</div>
          <div className="sports-cards">
            <NavLink to="/about-us" className="sport-card">
              About Us
            </NavLink>
            <NavLink to="/responsible-gaming" className="sport-card">
              Responsible Gaming
            </NavLink>
            <NavLink to="/terms-conditions" className="sport-card">
              Terms and conditions
            </NavLink>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    loggedIn: state.auth.loggedIn,
  };
};

export default connect(mapStateToProps)(Sitemap);
