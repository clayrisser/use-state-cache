import React, { FC, ReactNode } from 'react';
import AsyncStorage from './AsyncStorage';
import StateCacheConfigContext from './contexts/stateCacheConfig';
import pkg from '../package.json';

export interface ProviderProps {
  asyncStorage?: typeof AsyncStorage;
  children: ReactNode;
  enabled?: boolean;
  namespace?: string;
  silence?: boolean;
  strict?: boolean;
}

const Provider: FC<ProviderProps> = (props: ProviderProps) => (
  <StateCacheConfigContext.Provider
    value={{
      asyncStorage: props.asyncStorage!,
      enabled: props.enabled!,
      namespace: props.namespace!,
      silence: props.silence!,
      strict: props.strict!
    }}
  >
    {props.children}
  </StateCacheConfigContext.Provider>
);

Provider.defaultProps = {
  asyncStorage: AsyncStorage,
  enabled: true,
  namespace: pkg.name,
  silence: false,
  strict: false
};

export default Provider;
