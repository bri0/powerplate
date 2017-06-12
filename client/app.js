require('./injectGlobal');

const { invokeActions, rebindActions } = require('./actions');

require('./actions/user');

const mdcInit = require('./mdc');

$(() => {
  rebindActions();
  mdcInit();
  invokeActions('onReady');
});

