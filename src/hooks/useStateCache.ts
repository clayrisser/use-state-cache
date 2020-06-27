import AsyncStorage from '@callstack/async-storage';
import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import useStateCacheConfig from './useStateCacheConfig';

export default function useStateCache<T>(
  key: string,
  initialState: T,
  reconcile?: (cachedState: T, newState: T) => T
): [T | undefined, Dispatch<SetStateAction<T>>, boolean] {
  const [delayedStates, setDelayedStates] = useState<T[]>([]);
  const { enabled, namespace, silence, strict } = useStateCacheConfig();
  const [mutex, setMutex] = useState(enabled);
  const [state, setState] = useState<T | undefined>(
    enabled ? undefined : initialState
  );
  key = `${namespace}/${key}`;

  useEffect(() => {
    (async () => {
      if (!enabled) return;
      setMutex(false);
      try {
        const cachedState = JSON.parse(await AsyncStorage.getItem(key));
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
        if (typeof setStateAction === 'function') {
          const err = new Error(
            'cannot use set state action while mutex locked'
          );
          if (strict) {
            throw err;
          } else if (!silence) {
            console.warn(err);
          }
        }
        setDelayedStates([...delayedStates, setStateAction as T]);
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
        let state = (setStateAction as (prevState: T | undefined) => T)(
          prevState
        );
        if (reconcile && delayedStates.length) {
          state = delayedStates.reduce(
            (state: T, delayedState: T) => reconcile(state, delayedState),
            state
          );
        }
        setDelayedStates([]);
        if (enabled) AsyncStorage.setItem(key, JSON.stringify(state));
        return state;
      });
    }
    let state = setStateAction as T;
    if (reconcile && delayedStates.length) {
      state = delayedStates.reduce(
        (state: T, delayedState: T) => reconcile(state, delayedState),
        state
      );
    }
    setDelayedStates([]);
    if (enabled) AsyncStorage.setItem(key, JSON.stringify(state));
    return setState(state);
  }
  return [state, handleSetState, mutex];
}
