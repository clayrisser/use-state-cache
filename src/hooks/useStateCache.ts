import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import useStateCacheConfig from './useStateCacheConfig';

export default function useStateCache<T>(
  key: number | string | (number | string | void | null)[],
  initialState: T,
  reconcile?: (prevState: T, nextState: T) => T
): [T | undefined, Dispatch<SetStateAction<T>>, boolean] {
  const [delayedStates, setDelayedStates] = useState<T[]>([]);
  const {
    asyncStorage,
    enabled,
    namespace,
    silence,
    strict
  } = useStateCacheConfig();
  const AsyncStorage = useMemo(() => asyncStorage, []);
  const [mutex, setMutex] = useState(enabled);
  const [calculatedKey, setCalculatedKey] = useState<string | undefined>(
    calculateKey(key)
  );
  const [state, setState] = useState<T | undefined>(
    enabled ? undefined : initialState
  );

  function calculateKey(
    key: number | string | (number | string | void | null)[]
  ): string | undefined {
    if (Array.isArray(key)) {
      if (
        key.reduce(
          (voidKey: boolean, keyItem: null | number | string | void) => {
            if (typeof keyItem !== 'number' && !keyItem) voidKey = true;
            return voidKey;
          },
          false
        )
      ) {
        return undefined;
      }
      return [namespace, ...key].join('/');
    }
    if (typeof key === 'undefined' || key === null) return undefined;
    return [namespace, key].join('/');
  }

  function resolveStateAction(
    setStateAction: SetStateAction<T>,
    prevState: T | undefined
  ): T {
    return (setStateAction as (prevState: T | undefined) => T)(prevState);
  }

  useEffect(() => {
    setCalculatedKey(calculateKey(key));
  }, [key]);

  useEffect(() => {
    if (!enabled || !calculatedKey) return;
    (async () => {
      try {
        const cachedState = JSON.parse(
          await AsyncStorage.getItem(calculatedKey)
        );
        if (typeof cachedState === 'undefined' || cachedState === null) {
          setState(initialState);
        } else {
          setState(cachedState);
        }
      } catch (err) {
        setState(initialState);
      }
      setMutex(false);
    })();
  }, [calculatedKey]);

  useEffect(() => {
    if (mutex || !reconcile || !delayedStates.length) return;
    const newState = delayedStates.reduce(
      (prevState: T, nextState: T) => reconcile(prevState, nextState),
      state!
    );
    setDelayedStates([]);
    if (enabled) AsyncStorage.setItem(calculatedKey!, JSON.stringify(newState));
    return setState(newState);
  }, [mutex, delayedStates]);

  const handleSetState = useCallback(
    (setStateAction: SetStateAction<T>): void => {
      if (mutex) {
        if (reconcile) {
          let delayedState = setStateAction as T;
          if (typeof setStateAction === 'function') {
            delayedState = resolveStateAction(setStateAction, state);
          }
          setDelayedStates([...delayedStates, delayedState]);
        } else {
          const err = new Error('cannot set state while mutex locked');
          if (strict) {
            throw err;
          } else if (!silence) {
            console.warn(err);
          }
        }
        return;
      }
      if (typeof setStateAction === 'function') {
        return setState((prevState: T | undefined) => {
          const newState = resolveStateAction(setStateAction, prevState);
          if (enabled) {
            AsyncStorage.setItem(calculatedKey!, JSON.stringify(newState));
          }
          return newState;
        });
      }
      const newState = setStateAction as T;
      if (enabled)
        AsyncStorage.setItem(calculatedKey!, JSON.stringify(newState));
      return setState(newState);
    },
    [mutex, state]
  );

  return [state, handleSetState, mutex];
}
