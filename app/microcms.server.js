import { createClient } from "microcms-js-sdk";

export const microcmsClient = createClient({
  serviceDomain: "yah2903fh1", // service-domain は https://XXXX.microcms.io の XXXX 部分
  apiKey: process.env.MICROCMS_API_KEY,
});
