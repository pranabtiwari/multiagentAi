import proxy from "express-http-proxy";

export const proxyHeaders = (serviceUrl) => {
  return proxy(serviceUrl, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      const userId =
        srcReq.user?.id ||
        srcReq.user?.userId ||
        srcReq.user?._id ||
        srcReq.headers["x-user-id"];

      if (userId) {
        proxyReqOpts.headers["x-user-id"] = userId.toString();
      }

      return proxyReqOpts;
    },
  });
};