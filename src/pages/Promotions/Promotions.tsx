import React, { useEffect, useState } from "react";
import ReportBackBtn from "../../common/ReportBackBtn/ReportBackBtn";
import ReportsHeader from "../../common/ReportsHeader/ReportsHeader";
import { ReactComponent as PromotionsIcon } from "../../assets/images/icons/promotions-icon.svg?react";
import PromotionCard from "../../components/PromotionCard/PromotionCard";
import "./Promotions.scss";
import Modal from "../../components/Modal/Modal";
import { BannerObjData, RenderHtml } from "./Promotions.utils";
import { connect, useDispatch } from "react-redux";
import { setAlertMsg } from "../../store/common/commonActions";
import { RootState } from "../../models/RootState";
import { promotionBanner } from "../../description/promotionBanner";
import USABET_API from "../../api-services/usabet-api";
import moment from "moment";
import Spinner from "../../components/Spinner/Spinner";

type LockedBonusRecord = {
  _id: string;
  bonus_type: string;
  rolling_multiplier: number;
  total_rolling_amount: number;
  used_rolling_amount: number;
  total_locked_bonus_amount: number;
  unlocked_bonus_amount: number;
  status_str: string;
  is_expired: boolean;
  expire_at: string;
  created_at: string;
};

const Promotions: React.FC<{ langData: any }> = (props) => {
  const { langData } = props;
  const dispatch = useDispatch();
  const [promotionBanners, setPromotionBanners] = useState<BannerObjData[]>([]);
  const [showKnowMoreModal, setShowMoreModal] = useState(false);
  const [promotionDisplayData, setPromotionDisplayData] = useState("");
  const [lockedBonusList, setLockedBonusList] = useState<LockedBonusRecord[]>([]);
  const [lockedBonusLoading, setLockedBonusLoading] = useState(true);

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

  const fetchLockedBonusProgress = async () => {
    setLockedBonusLoading(true);
    try {
      const response = await USABET_API.post("/user/getLockedBonusProgress", {
        limit: 10,
        page: 1,
        status: "ALL",
      });
      const resData = response?.data;
      if (resData?.status && Array.isArray(resData?.data)) {
        setLockedBonusList(resData.data);
      } else {
        setLockedBonusList([]);
      }
    } catch (err) {
      setLockedBonusList([]);
    } finally {
      setLockedBonusLoading(false);
    }
  };

  useEffect(() => {
    getPromotionBanners();
  }, []);

  useEffect(() => {
    fetchLockedBonusProgress();
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
            <PromotionCard
              key={banner.bannerId}
              bannerData={banner}
              onKnowMorePress={handleKnowMoreClick}
              langData={langData}
            />
          ))}
      </div>

      <div className="locked-bonus-section">
        <h3 className="locked-bonus-title">
          {langData?.["locked_bonus_progress"] || "Locked Bonus Progress"}
        </h3>
        {lockedBonusLoading ? (
          <Spinner />
        ) : lockedBonusList.length > 0 ? (
          <div className="locked-bonus-list">
            {lockedBonusList.map((item) => (
              <div key={item._id} className="locked-bonus-card">
                <div className="locked-bonus-row">
                  <span className="locked-bonus-label">
                    {langData?.["bonus_type"] || "Bonus Type"}
                  </span>
                  <span className="locked-bonus-value">
                    {item.bonus_type?.replace(/_/g, " ") || "-"}
                  </span>
                </div>
                <div className="locked-bonus-row">
                  <span className="locked-bonus-label">
                    {langData?.["status"] || "Status"}
                  </span>
                  <span
                    className={`locked-bonus-value status-${item.status_str?.toLowerCase()}`}
                  >
                    {item.status_str || "-"}
                  </span>
                </div>
                <div className="locked-bonus-row">
                  <span className="locked-bonus-label">
                    {langData?.["rolling_multiplier"] || "Rolling Multiplier"}
                  </span>
                  <span className="locked-bonus-value">{item.rolling_multiplier ?? "-"}</span>
                </div>
                <div className="locked-bonus-row">
                  <span className="locked-bonus-label">
                    {langData?.["rolling_progress"] || "Rolling Progress"}
                  </span>
                  <span className="locked-bonus-value">
                    {item.used_rolling_amount ?? 0} / {item.total_rolling_amount ?? 0}
                  </span>
                </div>
                <div className="locked-bonus-row">
                  <span className="locked-bonus-label">
                    {langData?.["locked_bonus"] || "Locked Bonus"}
                  </span>
                  <span className="locked-bonus-value">
                    {item.total_locked_bonus_amount ?? 0} ({langData?.["unlocked"] || "Unlocked"}:{" "}
                    {item.unlocked_bonus_amount ?? 0})
                  </span>
                </div>
                <div className="locked-bonus-row">
                  <span className="locked-bonus-label">
                    {langData?.["expires_at"] || "Expires At"}
                  </span>
                  <span className="locked-bonus-value">
                    {item.expire_at
                      ? moment(item.expire_at).format("DD-MM-YYYY HH:mm")
                      : "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="locked-bonus-empty">
            {langData?.["no_locked_bonus_txt"] || "No locked bonus found"}
          </div>
        )}
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
