const fs = require('fs');

const ajson = require('../angular.json');
const pjson = require('../package.json');
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
        basePath = `https://${repoName}.${CLOUDFLARE_HOST}/`;
    } else {
        basePath = `https://${vals[3]}.github.io/${repoName}/`;
    }

    console.log(`🌎 Configuring gadget deployment URL: ${basePath}${pjson.name}.xml`);
    console.log(`📡 Hosting mode: ${hosting}`);

    // Update angular.json baseHref/deployUrl with full path to our app
    ajson.projects[pjson.name].architect.build.configurations.production.baseHref = basePath;
    ajson.projects[pjson.name].architect.build.configurations.production.deployUrl = basePath;

    // Ensure deploy options exist
    if (!ajson.projects[pjson.name].architect.deploy.options) {
        ajson.projects[pjson.name].architect.deploy.options = {};
    }

    // Set the deploy output directory so angular-cli-ghpages v2.x finds the build output.
    // The actual output dir (with or without /browser/) is resolved after build by yml2xml.js.
    ajson.projects[pjson.name].architect.deploy.options.dir = `dist/${pjson.name}`;

    // Configure CNAME for CloudFlare custom domain
    if (hosting === 'cloudflare') {
        ajson.projects[pjson.name].architect.deploy.options.cname = `${repoName}.${CLOUDFLARE_HOST}`;
    } else {
        delete ajson.projects[pjson.name].architect.deploy.options.cname;
    }

    fs.writeFile('./angular.json', JSON.stringify(ajson, null, 4), function writeJSON(err) {
        if (err) return console.log(err);
    });
});
