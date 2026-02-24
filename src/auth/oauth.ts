// Location: src/auth/oauth.ts

/**
 * Enhanced OAuth handler to support headless/proxied environments.
 */
export async function getAuthorizationCode(authUrl: string): Promise<string> {
  const isHeadless = process.env.HEADLESS === 'true' || !process.stdout.isTTY;
  
  console.log('\n--- AUTHENTICATION REQUIRED ---');
  
  if (!isHeadless) {
    try {
      // Attempt standard browser launch
      const open = (await import('open')).default;
      await open(authUrl);
      console.log('Opening browser for authentication...');
    } catch (err) {
      console.warn('Unable to open browser automatically. Switching to manual mode.');
    }
  }

  // MANUAL FALLBACK (The Core Fix)
  console.log('\nPlease visit the following URL in your local browser to authenticate:');
  console.log(`\x1b[36m${authUrl}\x1b[0m\n`); // Cyan color for visibility
  
  // Interactive prompt using readline
  const readline = (await import('readline')).createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    readline.question('Enter the authorization code from the browser: ', (code) => {
      readline.close();
      resolve(code.trim());
    });
  });
}
