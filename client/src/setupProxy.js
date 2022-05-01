const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function (app) {
  // In development environment,
  // redirct the request of port 3000 from browser to port 5000
  
  // There is a proxy in create-react-app, receive request from browser and
  // redirect it to server.
  app.use(
    ["/api", "/auth/google"],
    createProxyMiddleware({
//      target: "http://host.docker.internal:5000",
//     target: "http://localhost:5000",
      target: "http://ec2-18-207-63-121.compute-1.amazonaws.com:5000",
      secure: false,
    })
  );
};
