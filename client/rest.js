const rest = require('rest');
const mime = require('rest/interceptor/mime');
const errorCode = require('rest/interceptor/errorCode');
const defaultRequest = require('rest/interceptor/defaultRequest');
const csrf = require('rest/interceptor/csrf');
const { restRebind } = require('./actions');

const paramsInterceptor = require('rest/interceptor/params');

const client = rest
  .wrap(mime)
  .wrap(errorCode)
  .wrap(csrf)
  .wrap(paramsInterceptor)
  .wrap(defaultRequest, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'RESTClient',
    },
    method: 'GET',
  })
  .wrap(restRebind);

function request(path, data, options = {}) {
  const csrfToken = $('meta[name="csrf-token"]').attr('content');

  const requestParams = _.extend({
    path,
    csrfToken,
  }, options);

  if (!options.method || options.method === 'GET') {
    requestParams.params = data;
  } else {
    requestParams.entity = data;
  }

  return client(requestParams);
}

function deleteRequest(path, data) {
  return request(path, data, { method: 'DELETE' });
}

function postRequest(path, data) {
  return request(path, data, { method: 'POST' });
}

module.exports = {
  request,
  deleteRequest,
  postRequest,
};
