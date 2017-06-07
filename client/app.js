require('./injectGlobal');

const { invokeActions, rebindActions } = require('./actions');

require('./actions/user');

$(() => {
  rebindActions();
  invokeActions('onReady');
});

