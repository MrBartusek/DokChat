import { Settings } from '../client/hooks/useSettings';

export interface ElectronStore {
	refreshToken?: string;
  token?: string;
  disableAutoLogin?: boolean;
  debug?: boolean;
  settings?: Settings;
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
  updateSettings(settings: Settings): void;
  isPackaged: boolean;
}
