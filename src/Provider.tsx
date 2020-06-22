import React, { FC, ReactNode } from 'react';
import pkg from '../package.json';
import StateCacheConfigContext from './contexts/stateCacheConfig';

export interface ProviderProps {
  children: ReactNode;
  enabled?: boolean;
  namespace?: string;
  silence?: boolean;
  strict?: boolean;
}

const Provider: FC<ProviderProps> = (props: ProviderProps) => (
  <StateCacheConfigContext.Provider
    value={{
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
  enabled: true,
  namespace: pkg.name,
  silence: false,
  strict: false
};

export default Provider;
