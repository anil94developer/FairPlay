import React from "react";
import { Helmet } from "react-helmet-async";
import { DomainConfig } from "../../models/DomainConfig";
import { RootState } from "../../models/RootState";
import { connect } from "react-redux";

type SEOProps = {
  title: string;
  description: string;
  name: string;
  type: string;
  link: string;
  config: DomainConfig;
};
const SEO: React.FC<SEOProps> = ({
  title,
  description,
  name,
  type,
  link,
  config,
}) => {
  return (
    <>
      {config.payments ? (
        <Helmet prioritizeSeoTags>
          {/* Standard metadata tags */}
          <title>{title}</title>
          {link ? (
            <link
              rel="canonical"
              href={`https://${window.location.hostname}${link}`}
            />
          ) : null}
          <meta name="description" content={description} />
          {/* End standard metadata tags */}
          {/* Facebook tags */}
          <meta property="og:type" content={type} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          {/* End Facebook tags */}
          {/* Twitter tags */}
          <meta name="twitter:creator" content={name} />
          <meta name="twitter:card" content={type} />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          {/* End Twitter tags */}
        </Helmet>
      ) : null}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    config: state.common.domainConfig,
  };
};

export default connect(mapStateToProps, null)(SEO);
