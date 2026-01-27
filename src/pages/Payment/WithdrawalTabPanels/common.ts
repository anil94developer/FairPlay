import FEATURE_API from "../../../api-services/feature-api";
import { AccountDetails } from "../AccountDetails";

type SetAccountDetailsType = (accounts: AccountDetails[]) => void;

export const fetchPaymentMethod = async (
  paymentOption: string,
  setAccountDetails: SetAccountDetailsType
) => {
  try {
    const response = await FEATURE_API.get(`/agpay/v2/pgman/payment-methods`, {
      headers: {
        Authorization: sessionStorage.getItem("jwt_token"),
      },
      params: {
        admin: false,
        paymentOption:
          paymentOption === "GPAY" || paymentOption === "PHONEPE"
            ? "UPI"
            : paymentOption === "CRYPTO_WALLET_TRANSFER"
            ? "CRYPTO_WALLET"
            : paymentOption === "BANK_TRANSFER"
            ? "NEFT"
            : paymentOption,
      },
    });
    if (response.status === 200) {
      setAccountDetails(response?.data);
    } else {
    }
  } catch (error) {}
};
