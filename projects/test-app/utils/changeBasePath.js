const fs = require('fs');

const ajson = require('../../../angular.json');
const pjson = require('../../../package.json');
const gitRemoteOriginUrl = (...args) => import('git-remote-origin-url').then(({ default: fetch }) => fetch(...args));

const CLOUDFLARE_HOST = 'reveldigitalgadgets.io';

// Determine hosting mode from CLI arg or package.json config
const arg = process.argv[2];
let hosting;

if (arg === '--cloudflare') {
    hosting = 'cloudflare';
} else if (arg === '--github') {
    hosting = 'github';
} else {
    // Read from package.json reveldigital config
    hosting = (pjson.reveldigital && pjson.reveldigital.hosting) || 'github';
}

gitRemoteOriginUrl().then(name => {
    let vals = name.split('/');
    let repoName = vals[4].split('.')[0];
    let basePath;

    if (hosting === 'cloudflare') {
        basePath = `https://${CLOUDFLARE_HOST}/${repoName}/`;
    } else {
        basePath = `https://${vals[3]}.github.io/${repoName}/`;
    }

    console.log(`🌎 Configuring gadget deployment URL: ${basePath}${pjson.name}.xml`);
    console.log(`📡 Hosting mode: ${hosting}`);

    // Update angular.json baseHref/deployUrl with full path to our app
    ajson.projects[pjson.name].architect.build.configurations.production.baseHref = basePath;
    ajson.projects[pjson.name].architect.build.configurations.production.deployUrl = basePath;

    fs.writeFile('./angular.json', JSON.stringify(ajson, null, 4), function writeJSON(err) {
        if (err) return console.log(err);
    });
});
