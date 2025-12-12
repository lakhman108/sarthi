const path = require('path');

class PathManager {
  constructor() {
    // Detect if running in Docker
    this.isDocker = process.env.NODE_ENV === 'production' || 
                   process.env.DOCKER_ENV === 'true' ||
                   process.platform === 'linux'; // Simple Docker detection

    // Base directory - different for Docker vs Local
    this.baseDir = this.isDocker ? '/app' : path.resolve(__dirname, '..');
    
    console.log(`[PATHS] Environment: ${this.isDocker ? 'Docker' : 'Local'}`);
    console.log(`[PATHS] Base directory: ${this.baseDir}`);
  }

  getUploadsDir() {
    return path.join(this.baseDir, 'public', 'uploads');
  }

  getHlsDir() {
    return path.join(this.baseDir, 'public', 'hls');
  }

  getVideoHlsDir(videoName) {
    return path.join(this.getHlsDir(), videoName);
  }

  getProfilePicturesDir() {
    return path.join(this.baseDir, 'public', 'hls', 'profilePictures');
  }

  // Ensure directories exist
  ensureDirectories() {
    const fs = require('fs');
    const dirs = [
      this.getUploadsDir(),
      this.getHlsDir(),
      this.getProfilePicturesDir()
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`[PATHS] Created directory: ${dir}`);
      }
    });
  }

  // Get public URL for serving files
  getPublicUrl(relativePath) {
    const host = process.env.HOST || 'http://localhost:3000';
    return `${host}/api/hls/${relativePath}`;
  }
}

// Singleton instance
const pathManager = new PathManager();

// Ensure directories exist on startup
pathManager.ensureDirectories();

module.exports = pathManager;