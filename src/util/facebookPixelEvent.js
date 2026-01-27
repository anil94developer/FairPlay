const campaignIds = [
  "valuefp112",
  "value",
  "valuefp113",
  "valuefb556",
  "tamil",
  "telgu",
  "valuefb555",
  "valuefb557",
  "valuefp111",
  "jj20",
  "jj21",
  "vatty1",
  "vatty2",
  "valuefeb",
  "valueposter",
  "valuejune",
  "valuejune1",
  "valuejune2",
];

export const signUpEvent = () => {
  console.log("track - registration");
  if (
    window?.fbq &&
    campaignIds?.includes(localStorage.getItem("campaignId")?.toLowerCase())
  ) {
    window.fbq("track", "CompleteRegistration");
  }
};

export const depositEvent = () => {
  console.log("track - purchase");
  if (
    window?.fbq &&
    campaignIds?.includes(localStorage.getItem("campaignId")?.toLowerCase())
  ) {
    window.fbq("track", "Purchase");
  }
};

export const pageViewEvent = () => {
  console.log("track - pageview");
  if (
    window?.fbq &&
    campaignIds?.includes(localStorage.getItem("campaignId")?.toLowerCase())
  ) {
    window.fbq("track", "PageView");
  }
};

export const depositInitiated = () => {
  console.log("track - deposit initiation");
  if (
    window?.fbq &&
    campaignIds?.includes(localStorage.getItem("campaignId")?.toLowerCase())
  ) {
    window.fbq("track", "AddToCart");
  }
};
