import { createContext } from 'react';
import pkg from '../../package.json';

export interface StateCacheConfig {
  enabled: boolean;
  namespace: string;
  silence: boolean;
  strict: boolean;
}

export default createContext<StateCacheConfig>({
  enabled: true,
  namespace: pkg.name,
  silence: false,
  strict: false
});
