export interface ElectronStore {
	refreshToken?: string;
  token?: string;
  disableAutoLogin?: boolean;
  debug?: boolean
}

export interface ElectronAPI {
	openBrowser(url: string): void
  getConfig(): Promise<ElectronStore>;
  setToken(token: string): void;
  logout(): void;
  isPackaged: boolean;
}
