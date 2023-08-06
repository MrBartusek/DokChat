declare global {
  interface Window {
    electron: ElectronAPIType
  }
}

export interface ElectronAPIConfig {
	refreshToken: string;
  token: string;
}

interface ElectronAPIType {
	openBrowser(url: string): void
  getConfig(): ElectronAPIConfig;
  setToken(token: string): void;
  logout(): void;
}

export {};
