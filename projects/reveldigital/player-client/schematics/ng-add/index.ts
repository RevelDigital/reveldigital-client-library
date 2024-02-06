import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import {
  Rule, Tree, SchematicContext, apply, url, move, template, branchAndMerge,
  chain, mergeWith, SchematicsException, externalSchematic
} from '@angular-devkit/schematics';
import {
  NodeDependency,
  NodeDependencyType,
  addPackageJsonDependency,
} from '@schematics/angular/utility/dependencies';
import { virtualFs, workspaces } from '@angular-devkit/core';
import { MergeStrategy } from '@angular-devkit/schematics/src/tree/interface';
import { insertImport, addSymbolToNgModuleMetadata } from '@schematics/angular/utility/ast-utils';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import { BrowserBuilderOptions } from '@schematics/angular/utility/workspace-models';
import { applyToUpdateRecorder } from '@schematics/angular/utility/change';
import * as ts from 'typescript';

import { Schema as MyServiceSchema } from './schema';


// Just return the tree
export function ngAdd(options: MyServiceSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    //const chalk = require('chalk');

    context.logger.log('info', `🔧 Updating project: ${options.project}`);
    //context.logger.log('info', `✅️ YAML Exists: ${options.yamlExists}`);

    //const workspace = await readWorkspace(host);

    const host = createHost(tree);
    const { workspace } = await workspaces.readWorkspace('/', host);

    if (!options.project) {
      options.project = workspace.projects.keys().next().value;
    }
    // const project = workspace.projects.get(options.project);
    // if (!project) {
    //   throw new SchematicsException(`Invalid project name: ${options.project}`);
    // }

    const project = (options.project != null) ? workspace.projects.get(options.project) : null;
    if (!project) {
      throw new SchematicsException(`Invalid project name: ${options.project}`);
    }

    const projectType = project.extensions.projectType === 'application' ? 'app' : 'lib';
    if (projectType !== 'app') {
      throw new SchematicsException(`Invalid project type: ${projectType}. Project must be an application.`);
    }

    const buildTarget = project.targets.get('build');
    if (!buildTarget) {
      throw new SchematicsException('Target build not found');
    }
    const buildOptions = (buildTarget.options || {}) as unknown as BrowserBuilderOptions;
    const { main } = buildOptions; //'projects/test-app/src/main.ts'

    context.addTask(new NodePackageInstallTask());

    updatePackageJson(project.root || '', tree, options, context);

    return chain([
      addFiles('assets', project.sourceRoot),
      addFiles('utils', project.root),
      replaceHTML(project.sourceRoot),
      addPackageJsonDependencies(),
      installPackageJsonDependencies(),
      updateAppModule(main),
      callDeploySchematic(options.project, options.useGithubPages)
    ]);
  };
}

export function dependencies(options: any): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    const installTaskId = context.addTask(new NodePackageInstallTask({
      packageName: 'angular-cli-ghpages'
    }));

    context.addTask(new RunSchematicTask('after-dependencies', options), [installTaskId]);
  }
}

function callDeploySchematic(project: any, useGithubPages: boolean): Rule {
  return (_tree: Tree, _context: SchematicContext) => {

    if (useGithubPages) {
      const rule = externalSchematic(
        "angular-cli-ghpages",
        "ng-add",
        { project: project }
      );
      return rule;
    }

    return _tree;
    //_context.addTask(new RunSchematicTask("angular-cli-ghpages", "ng-add", _options));
  };
}

function replaceHTML(srcRoot: string): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const files = apply(url('templates'), [
      template({
      }),
      move(`${srcRoot}`),
    ]);
    return chain([mergeWith(files, MergeStrategy.Overwrite)])(tree, context);
  };
}

function addFiles(folder: string, root: string): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.log('info', `✅️ Adding ${folder}`);

    const files = apply(url(folder), [
      template({
      }),
      move(`${root}/${folder}`),
    ]);
    return chain([mergeWith(files, MergeStrategy.Overwrite)])(tree, context);
  };
}

function addPackageJsonDependencies(): Rule {
  return (host: Tree, context: SchematicContext) => {
    const dependencies: NodeDependency[] = [
      {
        type: NodeDependencyType.Dev,
        name: '@reveldigital/gadget-types',
        version: '^1.0.0',
      },
      {
        type: NodeDependencyType.Dev,
        name: 'xmlbuilder2',
        version: '^3.1.1',
      },
      {
        type: NodeDependencyType.Dev,
        name: 'node-html-parser',
        version: '6.1.12',
      },
      {
        type: NodeDependencyType.Dev,
        name: 'angular-cli-ghpages',
        version: '1.0.7',
      },
      {
        type: NodeDependencyType.Dev,
        name: 'git-remote-origin-url',
        version: '^4.0.0',
      },
      {
        type: NodeDependencyType.Dev,
        name: 'js-yaml',
        version: '^4.1.0',
      },
    ];
    dependencies.forEach(dependency => {
      addPackageJsonDependency(host, dependency);
      context.logger.log('info', `✅️ Added "${dependency.name}" into ${dependency.type}`);
    });

    return host;
  };
}

function installPackageJsonDependencies(): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    context.logger.log('info', `🔍 Installing packages...`);

    return host;
  };
}

function updateAppModule(mainPath: string): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.logger.log('info', '✅️ Updating appmodule');

    const modulePath = getAppModulePath(host, mainPath);
    context.logger.log('info', `Using module path: ${modulePath}`);

    addImport(host, modulePath, 'PlayerClientModule', '@reveldigital/player-client');
    //addImport(host, modulePath, 'isDevMode', '@angular/core');

    // register SW in application module
    // const importText = tags.stripIndent`
    //   ServiceWorkerModule.register('ngsw-worker.js', {
    //     enabled: !isDevMode(),
    //     // Register the ServiceWorker as soon as the application is stable
    //     // or after 30 seconds (whichever comes first).
    //     registrationStrategy: 'registerWhenStable:30000'
    //   })
    // `;
    const moduleSource = getTsSourceFile(host, modulePath);
    const metadataChanges = addSymbolToNgModuleMetadata(
      moduleSource,
      modulePath,
      'imports',
      'PlayerClientModule',
    );
    if (metadataChanges) {
      const recorder = host.beginUpdate(modulePath);
      applyToUpdateRecorder(recorder, metadataChanges);
      host.commitUpdate(recorder);
    }

    return host;
  };
}

function addImport(host: Tree, filePath: string, symbolName: string, moduleName: string): void {
  const moduleSource = getTsSourceFile(host, filePath);
  const change = insertImport(moduleSource, filePath, symbolName, moduleName);

  if (change) {
    const recorder = host.beginUpdate(filePath);
    applyToUpdateRecorder(recorder, [change]);
    host.commitUpdate(recorder);
  }
}

function getTsSourceFile(host: Tree, path: string): ts.SourceFile {
  const content = host.read(path);
  const source = ts.createSourceFile(path, content.toString(), ts.ScriptTarget.Latest, true);

  return source;
}

function updateScripts(path: string, config: any, tree: Tree, _options: any, _context: SchematicContext) {
  // const project = getProject(tree, _options);

  // if (!config['scripts']) {
  //   config.scripts = {};
  // }

  // let additionalFlags = '';

  // // Ivy support
  // const postInstall: string = config.scripts['postinstall'] || '';
  // if (postInstall.startsWith('ngcc')) {
  //   config.scripts['postinstall:bak'] = postInstall;
  //   config.scripts['postinstall'] = 'ngcc';

  //   _context.addTask(new RunSchematicTask('npmRun', { script: 'postinstall' }));
  // }

  // if (!_options.host) {
  //   // external web components need single bundle 
  //   additionalFlags = '--single-bundle';
  // }

  // // Heuristic for default project
  // if (!project.root) {
  //   config.scripts['build:externals'] = `ng build --extra-webpack-config ${path}webpack.externals.js --prod ${additionalFlags}`;
  // }

  // if (_options.project) {
  //   config.scripts[`build:${_options.project}:externals`] = `ng build --extra-webpack-config ${path}webpack.externals.js --prod --project ${_options.project} ${additionalFlags}`;
  // }

  config.scripts['build:gadget'] = 'npm run change-path && ng build && node utils/yml2xml.js src/assets/gadget.yaml dist';
  config.scripts['deploy:gadget'] = 'npm run build:gadget && ng deploy --no-build';
  config.scripts['change-path'] = 'node utils/changeBasePath.js';
}

function updatePackageJson(path: string, tree: Tree, _options: any, _context: SchematicContext) {
  const config = loadPackageJson(tree);
  updateScripts(path, config, tree, _options, _context);
  savePackageJson(config, tree);
}

function savePackageJson(config: any, tree: Tree) {
  const newContentAsString = JSON.stringify(config, null, 2) || '';
  tree.overwrite('package.json', newContentAsString);
}

function loadPackageJson(tree: Tree) {
  const pkg = tree.read('package.json');
  if (pkg === null)
    throw Error('could not read package.json');
  const contentAsString = pkg.toString('UTF-8');
  const config = JSON.parse(contentAsString);
  return config;
}

// function updatePolyfills(srcRoot: string): Rule {
//   return async (tree: Tree, context: SchematicContext) => {

//     console.log(`${srcRoot}polyfills.ts`);

//     const host = createHost(tree);
//     //const workspace = getWorkspace(tree);
//     //const targetProperty = 'es5BrowserSupport';
//     // const propertyExists = propertyExistsInWorkspace(targetProperty, workspace);
//     //let polyfillsData = tree.read(polyfillsFile).toString();
//     const polyfillsData = await host.readFile(`${srcRoot}/polyfills.ts`);

//     console.log(polyfillsData);

//     tree.overwrite(`${srcRoot}/polyfills.ts`, polyfillsData);

//     // if (propertyExists) {
//     //   // If project targets angular cli version >= 7.3
//     //   workspace.projects[workspace.defaultProject].architect.build.options[targetProperty] = true;
//     //   enableWebAnimationsAndGridSupport(tree, polyfillsFile, polyfillsData);
//     //   overwriteJsonFile(tree, 'angular.json', workspace);
//     // } else {
//     //   // If project targets angular cli version < 7.3
//     //   polyfillsData = enablePolyfills(tree, context);
//     //   enableWebAnimationsAndGridSupport(tree, polyfillsFile, polyfillsData);
//     // }
//   };
// }

function createHost(tree: Tree): workspaces.WorkspaceHost {
  return {
    async readFile(path: string): Promise<string> {
      const data = tree.read(path);
      if (!data) {
        throw new SchematicsException('File not found.');
      }
      return virtualFs.fileBufferToString(data);
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
