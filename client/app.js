const jquery = require('jquery');
const _ = require('underscore-contrib');
require('bootstrap/dist/js/bootstrap');
const { invokeActions, rebindActions } = require('./actions');

window.$ = jquery;
window.jQuery = jquery;
window._ = _;
global.xtmpl = require('blueimp-tmpl');
window.moment = require('moment');

const swal = require('sweetalert2');
window.swal = swal;

global.spinner = {
  show() {
    $('div.spinner-wrapper').show();
  },
  hide() {
    $('div.spinner-wrapper').hide();
  },
};

require('./actions/user');

$(() => {
  rebindActions();
  invokeActions('onReady');
});

