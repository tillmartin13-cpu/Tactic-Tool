import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export function createAppViteConfig(appDir: string) {
  const repoRoot = path.resolve(appDir, '../..');

  return defineConfig({
    root: appDir,
    envDir: repoRoot,
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(appDir, 'src'),
        '@sg/auth': path.resolve(repoRoot, 'packages/auth/src'),
        '@sg/history': path.resolve(repoRoot, 'packages/history/src'),
        '@sg/gpx': path.resolve(repoRoot, 'packages/gpx/src'),
        '@sg/map': path.resolve(repoRoot, 'packages/map/src'),
        '@sg/ui': path.resolve(repoRoot, 'packages/ui/src'),
      },
    },
    server: {
      fs: { allow: [repoRoot] },
    },
  });
}
