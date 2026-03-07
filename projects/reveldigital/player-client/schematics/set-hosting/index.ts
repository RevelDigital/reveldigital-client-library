import {
  Rule,
  Tree,
  SchematicContext,
  SchematicsException,
} from '@angular-devkit/schematics';
import { virtualFs, workspaces } from '@angular-devkit/core';

import { Schema as SetHostingSchema } from './schema';

const CLOUDFLARE_HOST = 'reveldigitalgadgets.io';

/**
 * Schematic to switch between CloudFlare CDN and GitHub Pages hosting.
 * Updates the hosting preference in package.json and CNAME config in angular.json.
 */
export function setHosting(options: SetHostingSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    // Update package.json hosting config
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

    // Update angular.json deploy CNAME config
    const host = createHost(tree);
    const { workspace } = await workspaces.readWorkspace('/', host);

    const projectName = config.name || workspace.projects.keys().next().value;
    const project = workspace.projects.get(projectName);

    if (project) {
      const deployTarget = project.targets.get('deploy');

      if (deployTarget) {
        if (!deployTarget.options) {
          deployTarget.options = {};
        }

        if (options.provider === 'cloudflare') {
          // Extract repo name from git remote for subdomain
          const repoName = await getRepoName(tree);
          if (repoName) {
            deployTarget.options['cname'] = `${repoName}.${CLOUDFLARE_HOST}`;
            context.logger.log('info', `✅️ CNAME configured: ${repoName}.${CLOUDFLARE_HOST}`);
          }
        } else {
          delete deployTarget.options['cname'];
        }

        await workspaces.writeWorkspace(workspace, host);
      }
    }

    const label = options.provider === 'cloudflare'
      ? 'CloudFlare CDN (reveldigitalgadgets.io)'
      : 'GitHub Pages';

    context.logger.log('info', `✅️ Hosting provider set to: ${label}`);
    context.logger.log('info', `Run "npm run build:gadget" to apply the new base path.`);
  };
}

/**
 * Extracts the repository name from the git remote origin URL.
 */
async function getRepoName(tree: Tree): Promise<string | null> {
  // Try to read from .git/config or use package.json repository field
  const pkg = tree.read('package.json');
  if (pkg) {
    const config = JSON.parse(pkg.toString('utf-8'));
    if (config.repository && config.repository.url) {
      const parts = config.repository.url.split('/');
      return parts[parts.length - 1].replace('.git', '');
    }
  }

  return null;
}

/**
 * Creates a workspace host for reading and writing files in the schematic tree.
 */
function createHost(tree: Tree): workspaces.WorkspaceHost {
  return {
    async readFile(path: string): Promise<string> {
      const data = tree.read(path);
      if (!data) {
        throw new SchematicsException('File not found.');
      }
      return virtualFs.fileBufferToString(data.buffer);
    },
    async writeFile(path: string, data: string): Promise<void> {
      return tree.overwrite(path, data);
    },
    async isDirectory(path: string): Promise<boolean> {
      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
    },
    async isFile(path: string): Promise<boolean> {
      return tree.exists(path);
    },
  };
}
