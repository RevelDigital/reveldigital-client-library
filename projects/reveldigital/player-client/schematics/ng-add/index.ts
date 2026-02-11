import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import {
  Rule,
  Tree,
  SchematicContext,
  apply,
  url,
  move,
  template,
  chain,
  mergeWith,
  SchematicsException,
} from '@angular-devkit/schematics';
import {
  NodeDependency,
  NodeDependencyType,
  addPackageJsonDependency,
} from '@schematics/angular/utility/dependencies';
import { virtualFs, workspaces } from '@angular-devkit/core';
import { MergeStrategy } from '@angular-devkit/schematics';
import { insertImport, addSymbolToNgModuleMetadata } from '@schematics/angular/utility/ast-utils';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import { BrowserBuilderOptions } from '@schematics/angular/utility/workspace-models';
import { applyToUpdateRecorder } from '@schematics/angular/utility/change';
import * as ts from 'typescript';

import { Schema as MyServiceSchema } from './schema';

/**
 * Main schematic rule for adding Revel Digital Player Client to an Angular project.
 * 
 * This schematic performs the following operations:
 * - Validates the target project is an Angular application
 * - Adds required dependencies to package.json
 * - Updates the app module to import PlayerClientModule
 * - Adds utility files and assets
 * - Configures build scripts for gadget development
 * - Optionally sets up GitHub Pages deployment
 */
export function ngAdd(options: MyServiceSchema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    context.logger.log('info', `🔧 Updating project: ${options.project}`);

    const host = createHost(tree);
    const { workspace } = await workspaces.readWorkspace('/', host);

    // Set default project if not specified
    if (!options.project) {
      options.project = workspace.projects.keys().next().value;
    }

    // Validate project exists
    const project = workspace.projects.get(options.project);
    if (!project) {
      throw new SchematicsException(`Invalid project name: ${options.project}`);
    }

    // Validate project is an application
    const projectType = project.extensions.projectType === 'application' ? 'app' : 'lib';
    if (projectType !== 'app') {
      throw new SchematicsException(`Invalid project type: ${projectType}. Project must be an application.`);
    }

    // Get build configuration
    const buildTarget = project.targets.get('build');
    if (!buildTarget) {
      throw new SchematicsException('Target build not found');
    }
    const buildOptions = (buildTarget.options || {}) as unknown as BrowserBuilderOptions;
    const main = (buildOptions as any).browser || buildOptions.main;

    // Schedule package installation
    context.addTask(new NodePackageInstallTask());

    // Update package.json with new scripts
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

/**
 * Adds dependencies required for the schematic.
 */
export function dependencies(options: any): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    const installTaskId = context.addTask(new NodePackageInstallTask({
      packageName: 'angular-cli-ghpages@~2.0.1'
    }));

    context.addTask(new RunSchematicTask('after-dependencies', options), [installTaskId]);
  };
}

/**
 * Conditionally adds GitHub Pages deployment schematic.
 */
function callDeploySchematic(project: any, useGithubPages: boolean): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    if (useGithubPages) {
      context.addTask(new RunSchematicTask('angular-cli-ghpages', 'ng-add', { project: project }));
    }
    return _tree;
  };
}

/**
 * Replaces HTML templates in the source directory.
 */
function replaceHTML(srcRoot: string): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const files = apply(url('templates'), [
      template({}),
      move(`${srcRoot}`),
    ]);
    return chain([mergeWith(files, MergeStrategy.Overwrite)])(tree, context);
  };
}

/**
 * Adds files from the specified folder to the project.
 */
function addFiles(folder: string, root: string): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.log('info', `✅️ Adding ${folder}`);

    const files = apply(url(folder), [
      template({}),
      move(`${root}/${folder}`),
    ]);
    return chain([mergeWith(files, MergeStrategy.Overwrite)])(tree, context);
  };
}

/**
 * Adds required dependencies to package.json.
 */
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
        version: '~2.0.1',
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

/**
 * Schedules package installation task.
 */
function installPackageJsonDependencies(): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    context.logger.log('info', `🔍 Installing packages...`);
    return host;
  };
}

/**
 * Updates the Angular app module to import PlayerClientModule.
 */
function updateAppModule(mainPath: string): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!mainPath) {
      context.logger.warn('No main entry point detected. Skipping PlayerClientModule registration.');
      return host;
    }

    context.logger.log('info', '✅️ Configuring Revel Digital Player Client integration');

    const modulePath = tryGetAppModulePath(host, mainPath);

    if (modulePath) {
      context.logger.log('info', `Detected NgModule bootstrap. Updating module at: ${modulePath}`);

      ensureImport(host, modulePath, 'PlayerClientModule', '@reveldigital/player-client');

      const moduleSource = getTsSourceFile(host, modulePath);
      const metadataChanges = addSymbolToNgModuleMetadata(
        moduleSource as any,
        modulePath,
        'imports',
        'PlayerClientModule',
      );

      if (metadataChanges?.length) {
        const recorder = host.beginUpdate(modulePath);
        applyToUpdateRecorder(recorder, metadataChanges);
        host.commitUpdate(recorder);
      }
    } else {
      context.logger.log('info', 'Detected standalone bootstrap (no AppModule). Updating main bootstrap configuration.');
      updateStandaloneBootstrap(host, mainPath, context);
    }

    return host;
  };
}

/**
 * Ensures the specified import exists in the given file.
 */
function ensureImport(host: Tree, filePath: string, symbolName: string, moduleName: string): void {
  const moduleSource = getTsSourceFile(host, filePath);
  const change = insertImport(moduleSource as any, filePath, symbolName, moduleName);

  if (change) {
    const recorder = host.beginUpdate(filePath);
    applyToUpdateRecorder(recorder, [change]);
    host.commitUpdate(recorder);
  }
}

/**
 * Creates a TypeScript SourceFile from a file path.
 */
function getTsSourceFile(host: Tree, path: string): ts.SourceFile {
  const content = host.read(path);
  if (!content) {
    throw new SchematicsException(`Unable to read TypeScript source: ${path}`);
  }
  return ts.createSourceFile(path, content.toString(), ts.ScriptTarget.Latest, true);
}

/**
 * Attempts to resolve the application module path, returning null if not found.
 */
function tryGetAppModulePath(host: Tree, mainPath: string): string | null {
  try {
    return getAppModulePath(host, mainPath);
  } catch (error) {
    if (error instanceof SchematicsException) {
      return null;
    }
    throw error;
  }
}

/**
 * Updates bootstrap configuration for standalone Angular applications.
 */
function updateStandaloneBootstrap(host: Tree, mainPath: string, context: SchematicContext): void {
  ensureImport(host, mainPath, 'PlayerClientModule', '@reveldigital/player-client');
  ensureImport(host, mainPath, 'importProvidersFrom', '@angular/core');

  const contentBuffer = host.read(mainPath);
  if (!contentBuffer) {
    throw new SchematicsException(`Unable to read main entry file: ${mainPath}`);
  }

  const content = contentBuffer.toString();
  const sourceFile = ts.createSourceFile(mainPath, content, ts.ScriptTarget.Latest, true);
  const bootstrapCall = findBootstrapCall(sourceFile);

  if (!bootstrapCall) {
    context.logger.warn('bootstrapApplication call not found. Skipping PlayerClientModule provider registration.');
    return;
  }

  if (bootstrapCall.arguments.length === 0) {
    context.logger.warn('bootstrapApplication call has no arguments. Skipping PlayerClientModule provider registration.');
    return;
  }

  if (bootstrapCall.arguments.length === 1) {
    const recorder = host.beginUpdate(mainPath);
    const indentation = calculateIndentation(content, bootstrapCall.getStart(sourceFile));
    const insertion = `, {\n${indentation}  providers: [importProvidersFrom(PlayerClientModule)]\n${indentation}}`;
    recorder.insertLeft(bootstrapCall.end - 1, insertion);
    host.commitUpdate(recorder);
    return;
  }

  const optionsArg = bootstrapCall.arguments[1];
  if (!ts.isObjectLiteralExpression(optionsArg)) {
    context.logger.warn('bootstrapApplication options argument is not an object literal. Skipping PlayerClientModule provider registration.');
    return;
  }

  const providersProperty = optionsArg.properties.find((property): property is ts.PropertyAssignment => {
    return ts.isPropertyAssignment(property) && isNamedProviders(property.name);
  });

  if (providersProperty) {
    if (!ts.isArrayLiteralExpression(providersProperty.initializer)) {
      context.logger.warn('bootstrapApplication providers property is not an array literal. Skipping PlayerClientModule provider registration.');
      return;
    }

    const arrayLiteral = providersProperty.initializer;
    const source = arrayLiteral.getSourceFile();
    const alreadyConfigured = arrayLiteral.elements.some(element => element.getText(source).includes('PlayerClientModule'));

    if (alreadyConfigured) {
      return;
    }

    const recorder = host.beginUpdate(mainPath);
    const needsComma = arrayLiteral.elements.length > 0 && !arrayLiteral.elements.hasTrailingComma;
    const insertion = `${needsComma ? ',' : ''} importProvidersFrom(PlayerClientModule)`;
    recorder.insertLeft(arrayLiteral.end - 1, insertion);
    host.commitUpdate(recorder);
    return;
  }

  const recorder = host.beginUpdate(mainPath);
  const objectIndentation = calculateIndentation(content, optionsArg.getStart(sourceFile));
  const propertyIndentation = `${objectIndentation}  `;
  const prefix = optionsArg.properties.length > 0 ? ',' : '';
  const insertion = `${prefix}\n${propertyIndentation}providers: [importProvidersFrom(PlayerClientModule)]\n${objectIndentation}`;
  recorder.insertLeft(optionsArg.end - 1, insertion);
  host.commitUpdate(recorder);
}

/**
 * Finds the bootstrapApplication call expression within the provided source file.
 */
function findBootstrapCall(sourceFile: ts.SourceFile): ts.CallExpression | undefined {
  let found: ts.CallExpression | undefined;

  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const expression = node.expression;
      if (ts.isIdentifier(expression) && expression.text === 'bootstrapApplication') {
        found = node;
        return;
      }
    }

    ts.forEachChild(node, visit);
  };

  ts.forEachChild(sourceFile, visit);
  return found;
}

/**
 * Determines if a property name corresponds to the "providers" key.
 */
function isNamedProviders(name: ts.PropertyName): boolean {
  return (ts.isIdentifier(name) || ts.isStringLiteral(name)) && name.text === 'providers';
}

/**
 * Calculates the indentation for the line containing the specified position.
 */
function calculateIndentation(content: string, position: number): string {
  const lineStart = content.lastIndexOf('\n', position);
  if (lineStart === -1) {
    return '';
  }
  const line = content.slice(lineStart + 1, position);
  const match = line.match(/^[\t ]*/);
  return match ? match[0] : '';
}

/**
 * Updates the scripts section in package.json with gadget-specific build commands.
 */
function updateScripts(path: string, config: any, tree: Tree, _options: any, _context: SchematicContext): void {
  if (!config.scripts) {
    config.scripts = {};
  }

  config.scripts['build:gadget'] = 'npm run change-path && ng build && node utils/yml2xml.js src/assets/gadget.yaml dist';
  config.scripts['deploy:gadget'] = 'npm run build:gadget && ng deploy --no-build';
  config.scripts['change-path'] = 'node utils/changeBasePath.js';
}

/**
 * Updates package.json with new scripts and configurations.
 */
function updatePackageJson(path: string, tree: Tree, options: any, context: SchematicContext): void {
  const config = loadPackageJson(tree);
  updateScripts(path, config, tree, options, context);
  savePackageJson(config, tree);
}

/**
 * Saves the updated package.json configuration to the tree.
 */
function savePackageJson(config: any, tree: Tree): void {
  const newContentAsString = JSON.stringify(config, null, 2) || '';
  tree.overwrite('package.json', newContentAsString);
}

/**
 * Loads and parses the package.json file from the tree.
 */
function loadPackageJson(tree: Tree): any {
  const pkg = tree.read('package.json');
  if (pkg === null) {
    throw new Error('could not read package.json');
  }
  const contentAsString = pkg.toString('utf-8');
  return JSON.parse(contentAsString);
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
