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
  reconcile?: (cachedState: T, newState: T) => T
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
        key.find(
          (keyItem: null | number | string | void) =>
            typeof keyItem === 'undefined' || keyItem === null
        )
      ) {
        return undefined;
      }
      return [namespace, ...key].join('/');
    }
    if (typeof key === 'undefined' || key === null) return undefined;
    return [namespace, key].join('/');
  }

  const reconcileDelayedState = useCallback(
    (newState: T, delayedStates: T[]): T => {
      if (reconcile && delayedStates.length) {
        newState = delayedStates.reduce(
          (newState: T, delayedState: T) => reconcile(newState, delayedState),
          newState
        );
      }
      setDelayedStates([]);
      return newState;
    },
    []
  );

  const resolveStateAction = useCallback(
    (setStateAction: SetStateAction<T>, prevState: T | undefined): T => {
      return (setStateAction as (prevState: T | undefined) => T)(prevState);
    },
    []
  );

  useEffect(() => {
    setCalculatedKey(calculateKey(key));
  }, [key]);

  useEffect(() => {
    (async () => {
      if (!enabled || !calculatedKey) return;
      setMutex(false);
      try {
        const cachedState = JSON.parse(
          await AsyncStorage.getItem(calculatedKey)
        );
        if (typeof cachedState !== 'undefined' && cachedState !== null) {
          setState(cachedState);
        } else {
          setState(initialState);
        }
      } catch (err) {
        setState(initialState);
      }
    })();
  }, []);

  function handleSetState(setStateAction: SetStateAction<T>): void {
    if (!calculatedKey) return;
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
        let newState = resolveStateAction(setStateAction, prevState);
        newState = reconcileDelayedState(newState, delayedStates);
        if (enabled) AsyncStorage.setItem(calculatedKey, JSON.stringify(state));
        return newState;
      });
    }
    let newState = setStateAction as T;
    newState = reconcileDelayedState(newState, delayedStates);
    if (enabled) AsyncStorage.setItem(calculatedKey, JSON.stringify(state));
    return setState(newState);
  }
  return [state, handleSetState, mutex];
}
