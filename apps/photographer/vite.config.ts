import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppViteConfig } from '../../tooling/vite.app';

const appDir = path.dirname(fileURLToPath(import.meta.url));

export default createAppViteConfig(appDir);
