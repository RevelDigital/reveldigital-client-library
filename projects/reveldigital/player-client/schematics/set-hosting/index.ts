import {
  Rule,
  Tree,
  SchematicContext,
  SchematicsException,
} from '@angular-devkit/schematics';

import { Schema as SetHostingSchema } from './schema';

/**
 * Schematic to switch between CloudFlare CDN and GitHub Pages hosting.
 * Updates the hosting preference in package.json and re-runs changeBasePath.
 */
export function setHosting(options: SetHostingSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const pkg = tree.read('package.json');
    if (pkg === null) {
      throw new SchematicsException('Could not read package.json');
    }

    const config = JSON.parse(pkg.toString('utf-8'));

    if (!config.reveldigital) {
      config.reveldigital = {};
    }

    config.reveldigital.hosting = options.provider;

    tree.overwrite('package.json', JSON.stringify(config, null, 2));

    const label = options.provider === 'cloudflare'
      ? 'CloudFlare CDN (reveldigitalgadgets.io)'
      : 'GitHub Pages';

    context.logger.log('info', `✅️ Hosting provider set to: ${label}`);
    context.logger.log('info', `Run "npm run build:gadget" to apply the new base path.`);

    return tree;
  };
}
