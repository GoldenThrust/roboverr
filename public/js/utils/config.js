// Config file to manage asset URLs across the application
class Config {
  constructor() {
    // Default to local assets if no CDN URL is provided
    this.assetUrl = '/assets';
  }

  // Initialize config with values passed from the server
  init(options = {}) {
    if (options.assetUrl) {
      this.assetUrl = options.assetUrl.endsWith('/') 
        ? options.assetUrl.slice(0, -1) // Remove trailing slash
        : options.assetUrl;
    }
    console.log(`Assets will be loaded from: ${this.assetUrl}`);
  }

  // Get the full URL for an asset
  getAssetUrl(path) {
    // Ensure path doesn't start with a slash when combined with assetUrl
    const assetPath = path.startsWith('/') ? path.substring(1) : path;
    return `${this.assetUrl}/${assetPath}`;
  }
}

// Export as a singleton
const config = new Config();
export default config;