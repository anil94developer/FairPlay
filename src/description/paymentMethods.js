export const paymentMethods = {
  depositMethods: {
    BANK_TRANSFER: ["ZENPAY", "ZENPAY1", "ZENPAY2"],
    UPI: ["ZENPAY", "ZENPAY1", "ZENPAY2"],
    CRYPTO_WALLET_TRANSFER: ["ZENPAYCRYPTO"],
  },
  withdrawMethods: {
    BANK_TRANSFER: ["ZENPAY", "ZENPAY1", "ZENPAY2"],
    CRYPTO_WALLET_TRANSFER: ["ZENPAYCRYPTO"],
  },
  perTxnLimit: 1000000,
  perDayLimit: 4,
  minTxnAmount: 500,
  minAmountLimitPerDay: 0,
  newUserMinDeposit: 500,
  newUserDepositLimit: 1,
  newUserMinWithdrawal: 500,
  newUserWithdrawalLimit: 1,
  minDeposit: 500,
};
