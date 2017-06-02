const interceptor = require('rest/interceptor');

const appActions = {};
const register = (key, func) => {
  if (!key) throw new Error('Need key!');
  if (!appActions[key]) appActions[key] = [];
  appActions[key].push(func);
  return null;
};
const getActions = (key) => {
  if (!key || !appActions[key]) return () => null;
  return appActions[key];
};
const invokeActions = (key, bind = window, ...args) => {
  const actions = getActions(key);
  _(actions).each((func) => func.bind(bind)(args));
};
const rebindActions = () => {
  $('[data-action]').each(function bind() {
    if ($(this).data('binded')) return;
    const key = $(this).data('action');
    const that = this;
    $(this).click(() => {
      invokeActions(key, that);
    });
    $(this).data('binded', 'yes');
  });
};
const restRebind = interceptor({
  response(response) {
    window.setTimeout(() => {
      rebindActions();
    }, 0);
    return response;
  },
});

module.exports = { register, invokeActions, rebindActions, restRebind };
