import Store from 'electron-store';
import { ElectronStore } from '../types/electron';

const store = new Store<ElectronStore>({ encryptionKey: 'IOCAdylnZHCly7txqFKySQkyc1umeoAl' });

export default store;
