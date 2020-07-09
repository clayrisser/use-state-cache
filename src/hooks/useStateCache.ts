import AsyncStorage from '@callstack/async-storage';
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
  key: string | string[],
  initialState: T,
  reconcile?: (cachedState: T, newState: T) => T
): [T | undefined, Dispatch<SetStateAction<T>>, boolean] {
  const [delayedStates, setDelayedStates] = useState<T[]>([]);
  const { enabled, namespace, silence, strict } = useStateCacheConfig();
  const [mutex, setMutex] = useState(enabled);
  const [state, setState] = useState<T | undefined>(
    enabled ? undefined : initialState
  );
  const memoizedKey = useMemo<string>(() => {
    if (Array.isArray(key)) return [namespace, ...key].join('/');
    return [namespace, key].join('/');
  }, []);

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
    (async () => {
      if (!enabled) return;
      setMutex(false);
      try {
        const cachedState = JSON.parse(await AsyncStorage.getItem(memoizedKey));
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
        if (enabled) AsyncStorage.setItem(memoizedKey, JSON.stringify(state));
        return newState;
      });
    }
    let newState = setStateAction as T;
    newState = reconcileDelayedState(newState, delayedStates);
    if (enabled) AsyncStorage.setItem(memoizedKey, JSON.stringify(state));
    return setState(newState);
  }
  return [state, handleSetState, mutex];
}
