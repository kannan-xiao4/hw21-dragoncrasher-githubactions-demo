const core = require('@actions/core');
const fs = require('fs');

// most @actions toolkit packages have async methods
async function run() {
  try {
    const licensingServiceBaseUrl = core.getInput('licensingServiceBaseUrl');
    const enableEntitlementLicensing = core.getInput('enableEntitlementLicensing');
    const enableFloatingApi = core.getInput('enableFloatingApi');
    const clientConnectTimeoutSec = core.getInput('clientConnectTimeoutSec');
    const clientHandshakeTimeoutSec = core.getInput('clientHandshakeTimeoutSec');
    const clientResolveEntitlementsTimeoutSec = core.getInput('clientResolveEntitlementsTimeoutSec');
    const clientUpdateLicenseTimeoutSec = core.getInput('clientUpdateLicenseTimeoutSec');
    const useLsd = core.getInput('useLsd');

    const createResponse = await fetch(`${licensingServiceBaseUrl}/v1/status`, { method: 'GET' });
    const resJson = await createResponse.json();
    core.info(resJson);

    const data = {
      licensingServiceBaseUrl: licensingServiceBaseUrl,
      enableEntitlementLicensing: enableEntitlementLicensing,
      enableFloatingApi: enableFloatingApi,
      clientConnectTimeoutSec: clientConnectTimeoutSec,
      clientHandshakeTimeoutSec: clientHandshakeTimeoutSec,
      clientResolveEntitlementsTimeoutSec: clientResolveEntitlementsTimeoutSec,
      clientUpdateLicenseTimeoutSec: clientUpdateLicenseTimeoutSec,
      useLsd: useLsd,
    };
    const json = JSON.stringify(data);
    core.debug(json); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    const fullPath = await getServicesConfigFilePath();

    fs.writeFile(fullPath, json);

    core.setOutput('servicesConfig', json);
    core.setOutput('configLocation', fullPath);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function getServicesConfigFilePath() {
  let configFilePath = '';
  if (process.platform === 'linux') {
    configFilePath = '/usr/share/unity3d/config/';
  } else if (process.platform === 'darwin') {
    configFilePath = '/Library/Application Support/Unity/config/';
  } else if (process.platform === 'win32') {
    configFilePath = '%PROGRAMDATA%/Unity/config/';
  }
  else throw new Error('Unknown plarform');

  if (!fs.existsSync(configFilePath)) {
    fs.mkdirSync(configFilePath);
  }

  return configFilePath;
}

run();
