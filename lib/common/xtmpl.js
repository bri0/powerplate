const fs = require('fs');

/**
 * Allow require html as string
 */
require.extensions['.html'] = (module, filename) => {
  module.exports = fs.readFileSync(filename, 'utf8');
};

const xtmpl = require('blueimp-tmpl');
xtmpl.load = (str) => str;
module.exports = xtmpl;
