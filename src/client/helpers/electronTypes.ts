declare global {
  interface Window {
    electron: ElectronAPIType
  }
}

export interface ElectronAPIConfig {
	refreshToken: string;
  token: string;
  disableAutoLogin?: boolean;
}

interface ElectronAPIType {
	openBrowser(url: string): void
  getConfig(): Promise<ElectronAPIConfig>;
  setToken(token: string): void;
  logout(): void;
}

export {};
