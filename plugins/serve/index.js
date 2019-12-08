const os = require('os');
const LocalWebServer = require('local-web-server');
const opn = require('open');
const reduceFlatten = require('reduce-flatten');
const getPort = require('get-port');
const { saveConfigPlugin, runOnceAfterBuildEndPlugin } = require('../helpers');

const findPort = (port, range = 999) => getPort({
  port: getPort.makeRange(port, port + range),
});

const findHosts = () => {
  const ipList = Object.keys(os.networkInterfaces())
    .map((key) => os.networkInterfaces()[key])
    .reduce(reduceFlatten, [])
    .filter((networkInterface) => networkInterface.family === 'IPv4')
    .map((networkInterface) => networkInterface.address);

  ipList.unshift(os.hostname());
  return ipList;
};

const createServer = (directory, port, open, spa, https) => {
  LocalWebServer.create({
    port,
    https,
    directory,
    compress: true,
    spa: spa ? 'index.html' : undefined,
  });

  const urls = findHosts()
    .map((host) => `http${https ? 's' : ''}://${host}${port === 80 ? '' : `:${port}`}`);

  // eslint-disable-next-line no-console
  console.log(`\nServing at ${urls.join(', ')}\n`);

  if (open) {
    opn(urls[0]);
  }
};

function servePlugin(pluginOptions = {}) {
  const { open, spa, secure } = pluginOptions;
  const config = {};
  let port = pluginOptions.port || 8000;
  return [
    saveConfigPlugin(config),
    runOnceAfterBuildEndPlugin(async () => {
      port = await findPort(port);
      createServer(config.output || 'dist', port, open || false, spa || false, secure || false);
    }, () => config.serve),
  ];
}

module.exports = servePlugin;