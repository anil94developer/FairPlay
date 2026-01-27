import React, { useEffect, useState } from "react";
import ReportBackBtn from "../../common/ReportBackBtn/ReportBackBtn";
import ReportsHeader from "../../common/ReportsHeader/ReportsHeader";
import { ReactComponent as PromotionsIcon } from "../../assets/images/icons/promotions-icon.svg?react";
import PromotionCard from "../../components/PromotionCard/PromotionCard";
import "./Promotions.scss";
import Modal from "../../components/Modal/Modal";
import { BannerObjData, BannerResData, RenderHtml } from "./Promotions.utils";
import { connect, useDispatch } from "react-redux";
import { setAlertMsg } from "../../store/common/commonActions";
import { RootState } from "../../models/RootState";
import { promotionBanner } from "../../description/promotionBanner";

const Promotions: React.FC<{ langData: any }> = (props) => {
  const { langData } = props;
  const dispatch = useDispatch();
  const [promotionBanners, setPromotionBanners] = useState<BannerObjData[]>([]);
  const [showKnowMoreModal, setShowMoreModal] = useState(false);
  const [promotionDisplayData, setPromotionDisplayData] = useState("");

  const handleKnowMoreClick = (bannerInfo: BannerObjData) => {
    const promotionDisplayContent = bannerInfo.displayContent;

    if (promotionDisplayContent) {
      setPromotionDisplayData(promotionDisplayContent);
      setShowMoreModal(true);
    } else {
      dispatch(
        setAlertMsg({
          type: "error",
          message: langData?.["no_display_content_txt"],
        })
      );
    }
  };

  const getPromotionBanners = () => {
    setPromotionBanners(promotionBanner);
  };

  useEffect(() => {
    getPromotionBanners();
  }, []);

  return (
    <div className="promotions-page">
      <ReportBackBtn back={langData?.["back"]} />
      <div>
        <ReportsHeader
          titleIcon={PromotionsIcon}
          reportName={langData?.["promotions"]}
          reportFilters={[]}
        />
      </div>
      <div className="promotion-card-ctn">
        {promotionBanners.length > 0 &&
          promotionBanners?.map((banner) => (
            <>
              <PromotionCard
                bannerData={banner}
                onKnowMorePress={handleKnowMoreClick}
                langData={langData}
              />
            </>
          ))}
      </div>

      <Modal
        open={showKnowMoreModal}
        closeHandler={() => setShowMoreModal(false)}
        title={langData?.["promotion_info"]}
        size="xs"
        disableFullScreen
      >
        <div className="promotions-modal-ctn">
          <RenderHtml htmlString={promotionDisplayData} />
        </div>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(Promotions);
