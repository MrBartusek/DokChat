import { Settings } from '../client/hooks/useSettings';

export interface ElectronStore {
	refreshToken?: string;
  token?: string;
  autoLogin?: boolean;
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
  getConfig(): Promise<ElectronStore>;
  setToken(token: string): void;
  logout(): void;
  updatePresence(config: ElectronPresenceConfig): void;
  updateSettings(settings: Settings): void;
  isFocused(): Promise<boolean>;
  isPackaged: boolean;
}
