interface MatrixCredentials {
  homeserver: string;
  accessToken: string;
  userId: string;
}

class MatrixConfig {
  private credentials: MatrixCredentials | null = null;
  private isConfigured = false;

  setCredentials(homeserver: string, accessToken: string, userId: string) {
    this.credentials = {
      homeserver,
      accessToken,
      userId
    };
    this.isConfigured = true;
    console.log(`✅ Matrix credentials configured for ${userId} on ${homeserver}`);
  }

  getCredentials(): MatrixCredentials | null {
    return this.credentials;
  }

  isReady(): boolean {
    return this.isConfigured && this.credentials !== null;
  }

  validateCredentials(): boolean {
    if (!this.credentials) return false;
    
    const { homeserver, accessToken, userId } = this.credentials;
    
    // Basic validation
    if (!homeserver.startsWith('https://')) return false;
    if (!accessToken || accessToken.length < 10) return false;
    if (!userId.startsWith('@') || !userId.includes(':')) return false;
    
    return true;
  }

  getStatus(): string {
    if (!this.isConfigured) {
      return 'Matrix credentials not configured';
    }
    
    if (!this.validateCredentials()) {
      return 'Matrix credentials invalid';
    }
    
    return 'Matrix federation ready';
  }
}

export const matrixConfig = new MatrixConfig();

// Easy setup function for when you get your credentials
export function setupMatrixCredentials(homeserver: string, accessToken: string, userId: string) {
  matrixConfig.setCredentials(homeserver, accessToken, userId);
  return matrixConfig.isReady();
}