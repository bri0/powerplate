window.$ = require('jquery/dist/jquery.slim.min');
window.jQuery = require('jquery/dist/jquery.slim.min');
window._ = require('underscore/underscore-min');
window.swal = require('sweetalert2/dist/sweetalert2.min');
require('bootstrap/dist/js/bootstrap.min');
window.mdc = require('material-components-web/dist/material-components-web.min');

global.spinner = {
  show() {
    $('div.spinner-wrapper').show();
  },
  hide() {
    $('div.spinner-wrapper').hide();
  },
};

