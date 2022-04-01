const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function (app) {
  // In development environment,
  // redirct the request of port 3000 from browser to port 5000
  
  // There is a proxy in create-react-app, receive request from browser and
  // redirct it to server.
  app.use(
    ["/api", "/auth/google"],
    createProxyMiddleware({
      target: "http://localhost:5000",
    })
  );
};
