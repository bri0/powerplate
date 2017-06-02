const rest = require('rest');
const mime = require('rest/interceptor/mime');
const errorCode = require('rest/interceptor/errorCode');
const defaultRequest = require('rest/interceptor/defaultRequest');
const pathPrefix = require('rest/interceptor/pathPrefix');
const template = require('rest/interceptor/template');

const client = rest
  .wrap(mime)
  .wrap(errorCode)
  .wrap(defaultRequest, {
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip/deflate',
      'Content-Type': 'application/json',
      Authorization: `OAuth ${process.env.IRON_WORKER_TOKEN}`,
    },
  })
  .wrap(pathPrefix, { prefix: process.env.IRON_WORKER_PREFIX })
  .wrap(template, {
    params: {
      project_id: process.env.IRON_WORKER_PROJECT_ID,
      code_name: process.env.IRON_WORKER_CODE_NAME,
    },
  });

exports.client = client;

exports.queueYTChannelCheckTask = (userId) => {
  const task = 'getYoutubeChannelInfo';
  const payload = {
    task,
    userId,
  };

  console.log('Start queueing youtube analysis for userId: ', payload.userId);
  return client({
    method: 'POST',
    path: '/projects{/project_id}/tasks',
    entity: {
      tasks: [{
        code_name: process.env.IRON_WORKER_CODE_NAME,
        payload: JSON.stringify(payload),
      }],
    },
  });
};
