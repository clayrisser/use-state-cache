import { createContext } from 'react';
import AsyncStorage from '../AsyncStorage';
import pkg from '../../package.json';

export interface StateCacheConfig {
  asyncStorage: typeof AsyncStorage;
  enabled: boolean;
  namespace: string;
  silence: boolean;
  strict: boolean;
}

export default createContext<StateCacheConfig>({
  asyncStorage: AsyncStorage,
  enabled: true,
  namespace: pkg.name,
  silence: false,
  strict: false
});
