import { ElectronAPI } from '../../types/electron';

declare global {
    interface Window {
      electron: ElectronAPI
    }
}

export {};
