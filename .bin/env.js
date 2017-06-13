const fs = require('fs');
const envSettings = fs.existsSync('.bin/env.json') ? JSON.parse(fs.readFileSync('.bin/env.json')) : {};
const command = process.argv[2];
const namespace = process.argv[3] || 'defaultNamespace';
const argvKey = process.argv[4] || 'default';

switch (command) {
  case 'list': {
    console.log((envSettings[namespace] && envSettings[namespace][argvKey]) || '');
    break;
  }
  case 'add': {
    const argvVal = process.argv[5];
    if (argvVal) {
      if (!envSettings[namespace]) envSettings[namespace] = {};
      envSettings[namespace][argvKey] = argvVal;
      console.log('Setting Done');
      fs.writeFileSync('.bin/env.json', JSON.stringify(envSettings, null, 2));
    } else {
      console.log('Usage:');
      console.log('  node .bin/env.js add namespace key val');
    }
    break;
  }
  case 'remove': {
    if (envSettings[namespace] && envSettings[namespace][argvKey]) delete envSettings[namespace][argvKey];
    fs.writeFileSync('.bin/env.json', JSON.stringify(envSettings, null, 2));
    console.log('Deleted');
    break;
  }
  default: {
    console.log('Usage:');
    console.log('  node .bin/env.js command namespace [key] [val]');
    console.log('  command: one of [list, add, remove]');
    console.log('    list: List value of key for namespace or all namespace');
    break;
  }
}

