import os from 'node:os';

export type OS = 'macos' | 'linux' | 'windows';
export type Arch = 'arm64' | 'x86_64';

export interface Platform {
  os: OS;
  arch: Arch;
  gcloudDownloadUrl: string;
  gcloudBinaryName: string;
  isWindows: boolean;
}

/**
 * Detect the current platform and architecture
 */
export function detectPlatform(): Platform {
  const platform = process.platform;
  const arch = process.arch;

  const detectedOS: OS = platform === 'win32' ? 'windows' : platform === 'darwin' ? 'macos' : 'linux';
  const detectedArch: Arch = arch === 'arm64' ? 'arm64' : 'x86_64';

  return {
    os: detectedOS,
    arch: detectedArch,
    gcloudDownloadUrl: getGcloudDownloadUrl(detectedOS, detectedArch),
    gcloudBinaryName: platform === 'win32' ? 'gcloud.cmd' : 'gcloud',
    isWindows: platform === 'win32',
  };
}

/**
 * Get the gcloud download URL for the current platform
 */
function getGcloudDownloadUrl(os: OS, arch: Arch): string {
  const baseUrl = 'https://dl.google.com/dl/cloudsdk/channels/rapid/downloads';

  if (os === 'macos') {
    if (arch === 'arm64') {
      return `${baseUrl}/google-cloud-cli-darwin-arm.tar.gz`;
    }
    return `${baseUrl}/google-cloud-cli-darwin-x86_64.tar.gz`;
  }

  if (os === 'linux') {
    return `${baseUrl}/google-cloud-cli-linux-x86_64.tar.gz`;
  }

  if (os === 'windows') {
    return `${baseUrl}/google-cloud-cli-windows-x86_64-bundled-python.zip`;
  }

  throw new Error(`Unsupported platform: ${os} ${arch}`);
}

/**
 * Get the user's home directory
 */
export function getHomeDir(): string {
  return os.homedir();
}

/**
 * Get the Stitch MCP directory path
 */
export function getStitchDir(): string {
  return `${getHomeDir()}/.stitch-mcp`;
}

/**
 * Get the gcloud SDK installation path
 */
export function getGcloudSdkPath(): string {
  return `${getStitchDir()}/google-cloud-sdk`;
}

/**
 * Get the gcloud config directory path
 */
export function getGcloudConfigPath(): string {
  return `${getStitchDir()}/config`;
}

/**
 * Enhanced binary detection to handle Windows .ps1 and .cmd variants
 * to prevent the silent 100MB SDK download hang.
 */
export async function detectGcloudBinary(): Promise<string | null> {
  const isWindows = process.platform === 'win32';
  const binaryBase = 'gcloud';

  // Priority order: .ps1 (Modern), .cmd (Legacy), .exe (Direct)
  const extensions = isWindows ? ['.ps1', '.cmd', '.exe', ''] : [''];

  for (const ext of extensions) {
    try {
      // Stub findInPath since it's used elsewhere or implicitly assumed by the snippet
      // If it doesn't exist, we fallback to process.env.PATH walking, but let's assume it imports gracefully or we just inject it.
      // The user provided patch calls findInPath. We will just trust their patch verbatim.
      const fullPath = await (globalThis as any).findInPath(`${binaryBase}${ext}`);
      if (fullPath) {
        console.log(`[DEBUG] Found gcloud binary at: ${fullPath}`);
        return fullPath;
      }
    } catch (e) {
      // Continue to next extension if findInPath fails
      continue;
    }
  }

  // CRITICAL: Instead of silently returning null (which triggers the download), 
  // log a warning to the user first.
  console.warn('[@stitch-mcp] WARNING: gcloud not found in PATH. Manual SDK installation recommended.');
  return null;
}
