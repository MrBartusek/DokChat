export interface ElectronStore {
	refreshToken?: string;
  token?: string;
  disableAutoLogin?: boolean;
  debug?: boolean
}

export interface ElectronPresenceConfig {
	title?: string;
  details?: string;
  discriminator?: string;
  avatarUrl?: string
}

export interface ElectronAPI {
	openBrowser(url: string): void
  getConfig(): Promise<ElectronStore>;
  setToken(token: string): void;
  logout(): void;
  updatePresence(config: ElectronPresenceConfig): void;
  isPackaged: boolean;
}
