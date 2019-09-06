import { BuildConfig, BuildTask } from './types';
import { logVersion, startLiveServer, setupPreviewApp, bundle, clean } from './tasks';
import { defaultConfig } from './defaults';
import { createDistFolder } from './tasks/createDistFolder';

const getConfig = (config: Partial<BuildConfig>): BuildConfig => ({
  ...defaultConfig,
  ...config,
});

const defaultTasks: BuildTask[] = [
  logVersion,
  clean,
  createDistFolder,
  setupPreviewApp,
  bundle,
];

export const createBuild = (config: Partial<BuildConfig> = {}, extraTasks: BuildTask[] = []): Function => {
  const configuration = getConfig(config || {});

  return async () => {
    for(const task of [...defaultTasks, ...extraTasks]) {
      await task(configuration, false);
    }
  }
};

export const createServe = (config: Partial<BuildConfig> = {}, extraTasks: BuildTask[]): Function => {
  const configuration = getConfig(config || {});

  return async () => {
    for(const task of [...defaultTasks, ...extraTasks]) {
      await task(configuration, true);
    }
  }
};

// compileLoners();
  // copyResources();
  // copyDependencies();

// // Both
// Livereload
// Preview Server
// Log version
// postcss
// Scss compile
// uglify

// // New Projects
// Bundle

// // Old Projects
// stats
// Image Copy
// Iconfonts
// Scripts all
// Styles all
// JS Transpile
// TS Transpile
// move modules