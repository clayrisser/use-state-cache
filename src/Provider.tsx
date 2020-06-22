import React, { FC, ReactNode } from 'react';
import pkg from '../package.json';
import StateCacheConfigContext, {
  StateCacheConfig
} from './contexts/stateCacheConfig';

export interface ProviderProps extends StateCacheConfig {
  children: ReactNode;
}

const Provider: FC<ProviderProps> = (props: ProviderProps) => (
  <StateCacheConfigContext.Provider
    value={{
      enabled: props.enabled,
      namespace: props.namespace,
      silence: props.silence,
      strict: props.strict
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
