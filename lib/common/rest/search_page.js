const rest = require('rest');
const mime = require('rest/interceptor/mime');
const errorCode = require('rest/interceptor/errorCode');
const defaultRequest = require('rest/interceptor/defaultRequest');
const csrf = require('rest/interceptor/csrf');

// TODO rest/interceptor/params marked as deprecated, so we should get rid of it in the future
const paramsInterceptor = require('rest/interceptor/params');

const client = rest
  .wrap(mime)
  .wrap(errorCode)
  .wrap(csrf)
  .wrap(paramsInterceptor)
  .wrap(defaultRequest, {
    headers: {
      Accept: 'text/html',
    },
    method: 'GET',
  });

function doRequest(data, asEntity = false, options = {}) {
  /* eslint-disable no-underscore-dangle */
  const csrfToken = data._csrf;
  delete data._csrf;

  if (data.json) {
    delete data.json;
    options.headers['Content-Type'] = 'application/json';
  }
  /* eslint-enable no-underscore-dangle */

  const url = data.url;
  delete data.url;

  const requestParams = _.extend({
    path: url,
    csrfToken,
  }, options);

  if (asEntity) {
    requestParams.entity = data;
  } else {
    requestParams.params = data;
  }

  return client(requestParams);
}

function doGETRequest(data) {
  return doRequest(data);
}

function doDELETERequest(data) {
  return doRequest(data, true,
    { method: 'DELETE', headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' } });
}

function doPOSTRequest(data) {
  return doRequest(data, true,
    { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' } });
}

// Data should contain "url" and "_csrf"
module.exports = {
  doGETRequest,
  doPOSTRequest,
  doDELETERequest,
  loadTable(data) {
    return doGETRequest(data);
  },
  addCandidateToCampaign(data) {
    return doPOSTRequest(data);
  },
  removeCandidateFromCampaign(data) {
    return doDELETERequest(data);
  },
  applyPriceProposal(data) {
    return doPOSTRequest(data);
  },
  applyPriceFinal(data) {
    return doPOSTRequest(data);
  },
  approveVideo(data) {
    return doPOSTRequest(data);
  },
  rejectVideo(data) {
    return doPOSTRequest(data);
  },
  inviteInfluencersToCampaign(data) {
    return doPOSTRequest(data);
  },
  changeInfluencersStatus(data) {
    return doPOSTRequest(data);
  },
  deleteCampaign(data) {
    return doDELETERequest(data);
  },
  postSaveTags(data) {
    return doPOSTRequest(data);
  },
  deleteChannel(data) {
    return doDELETERequest(data);
  },
  restoreChannel(data) {
    return doPOSTRequest(data);
  },
};

