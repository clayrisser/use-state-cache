import CallstackAsyncStorage from '@callstack/async-storage';

export type Callback<T = string | number | boolean> = (
  err: Error,
  value: T
) => any;

export default abstract class AsyncStorage {
  static async clear(): Promise<void> {
    return CallstackAsyncStorage.clear();
  }

  static async getAllKeys(cb?: Callback<string[]>): Promise<string[]> {
    return CallstackAsyncStorage.getAllKeys(cb);
  }

  static async getItem<T = string | number | boolean>(
    key: string,
    cb?: Callback<T>
  ): Promise<T> {
    return CallstackAsyncStorage.getItem(key, cb);
  }

  static async removeItem(key: string, cb?: Callback<void>): Promise<void> {
    return CallstackAsyncStorage.removeItem(key, cb);
  }

  static async setItem<T = string | number | boolean>(
    key: string,
    value: T,
    cb?: Callback<T>
  ): Promise<void> {
    CallstackAsyncStorage.setItem(key, value, cb);
  }
}
