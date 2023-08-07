import Store from 'electron-store';
import { ElectronStore } from '../types/electron';

const store = new Store<ElectronStore>();

export default store;
