import FEATURE_API from "../../../api-services/feature-api";
import USABET_API from "../../../api-services/usabet-api";
import { AccountDetails } from "../AccountDetails";

type SetAccountDetailsType = (accounts: AccountDetails[]) => void;

export type WalletPaymentType = {
  _id: string;
  name?: string;
  category?: string;
  payment_type?: string;
  image?: string;
};

export const fetchWalletBankAccountTypesGet = async (): Promise<
  WalletPaymentType[]
> => {
  try {
    const response = await USABET_API.post(
      `/wallet/bankAccountTypesGet`,
      { limit: 10, page: 1, payment_type: "WITHDRAW" }
    );
    const data = response?.data;
    const list = data?.data ?? data;
    if (Array.isArray(list)) {
      return list.filter((t: any) => t?._id);
    }
    return [];
  } catch (error) {
    return [];
  }
};

const mapBankAccount = (acc: any) => ({
  id: acc._id,
  paymentMethodDetails: {
    accountNumber: acc.account_number,
    ifscCode: acc.ifsc_code,
    accountHolderName: acc.holder_name,
    bankName: acc.bank_name,
    bankType: acc.bank_type,
  },
});

const mapCryptoAccount = (acc: any) => ({
  id: acc._id,
  paymentMethodDetails: {
    walletAddress: acc.crypto_wallet,
    cryptoCurrency: acc.crypto_coin_type,
    blockchain: acc.crypto_coin_type || acc.blockchain,
    accountNumber: acc.crypto_wallet,
    accountHolderName: acc.holder_name,
  },
});

const mapUpiAccount = (acc: any) => ({
  id: acc._id,
  paymentMethodDetails: {
    upiId: acc.upi_id,
    upiPhoneNumber: acc.upi_phone_number,
    accountHolderName: acc.holder_name,
    accountNumber: acc.upi_id,
  },
});

export const fetchWalletUpiAccounts = async (
  setAccountDetails: SetAccountDetailsType,
  upiAccountTypeId?: string
) => {
  if (!upiAccountTypeId) return;
  try {
    const response = await USABET_API.post(`/wallet/bankAccountGet`, {
      limit: 10,
      page: 1,
      bank_account_type_id: upiAccountTypeId,
    });
    const rawData = response?.data?.data ?? response?.data;
    const list = Array.isArray(rawData) ? rawData : [];
    if (response?.data?.status && list.length >= 0) {
      const activeOnly = list.filter((acc: any) => !acc?.is_deleted);
      const mapped = activeOnly.map((acc: any) => mapUpiAccount(acc));
      setAccountDetails(mapped);
    }
  } catch (error) {}
};

export const fetchWalletBankAccounts = async (
  setAccountDetails: SetAccountDetailsType,
  bankAccountTypeId?: string
) => {
  try {
    const bank_account_type_id =
      bankAccountTypeId || "";
    const response = await USABET_API.post(`/wallet/bankAccountGet`, {
      limit: 10,
      page: 1,
      bank_account_type_id,
    });
    if (response?.data?.status && Array.isArray(response?.data?.data)) {
      const activeOnly = response.data.data.filter(
        (acc: any) => !acc?.is_deleted
      );
      const mapped = activeOnly.map((acc: any) => mapBankAccount(acc));
      setAccountDetails(mapped);
    }
  } catch (error) {
    // Fallback: wallet list API may not exist yet
  }
};

export const fetchWalletCryptoAccounts = async (
  setAccountDetails: SetAccountDetailsType,
  cryptoAccountTypeId?: string
) => {
  if (!cryptoAccountTypeId) return;
  try {
    const bank_account_type_id = cryptoAccountTypeId;
    const response = await USABET_API.post(`/wallet/bankAccountGet`, {
      limit: 10,
      page: 1,
      bank_account_type_id,
    });
    if (response?.data?.status && Array.isArray(response?.data?.data)) {
      const activeOnly = response.data.data.filter(
        (acc: any) => !acc?.is_deleted
      );
      const mapped = activeOnly.map((acc: any) => mapCryptoAccount(acc));
      setAccountDetails(mapped);
    }
  } catch (error) {}
};

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
