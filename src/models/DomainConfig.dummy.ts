import { DomainConfig } from "./DomainConfig";

export const dummyDomainConfig: DomainConfig = {
  demoUser: false,
  signup: true,
  whatsapp: true,
  payments: true,
  bonus: true,
  affiliate: true,
  depositWagering: true,
  suppportContacts: [
    {
      type: "email",
      value: "support@example.com",
      label: "Email Support",
    },
    {
      type: "phone",
      value: "+1234567890",
      label: "Phone Support",
    },
    {
      type: "whatsapp",
      value: "+1234567890",
      label: "WhatsApp Support",
    },
    {
      type: "livechat",
      value: "https://livechat.example.com",
      label: "Live Chat",
    },
  ],
  apkUrl: "https://example.com/app.apk",
  b2cEnabled: true,
  ruleScope: "HOUSE",
};

export default dummyDomainConfig;
