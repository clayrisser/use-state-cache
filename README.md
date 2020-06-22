# use-state-cache

[![GitHub stars](https://img.shields.io/github/stars/codejamninja/use-state-cache.svg?style=social&label=Stars)](https://github.com/codejamninja/use-state-cache)

> react hook to cache state

Please ★ this repo if you found it useful ★ ★ ★

## Features

- supports react web
- supports react native

## Installation

```sh
npm install --save use-state-cache
```

## Dependencies

- [NodeJS](https://nodejs.org)

## Usage

### Setup the provider

```ts
import React, { FC } from 'react';
import Todo from './Todo';
import { Provider as UseStateCacheProvider } from 'use-state-cache';

export interface AppProps {}

const App: FC<AppProps> = (props: AppProps) => (
  <UseStateCacheProvider>
    <Todo />
  </UseStateCacheProvider>
);

export default App;
```

### Use the hook

```ts
import React, { FC, useState } from 'react';
import useStateCache from 'use-state-cache';

export interface TodoProps {}

const Todo: FC<TodoProps> = (props: TodoProps) => {
  const { todo, setTodo } = useState('');
  const { todos, setTodos } = useStateCache<string[]>([]);

  function handleClick() {
    if (todos) setTodos([...todos, todo]);
  }

  if (!todos) return <div>Loading . . .</div>
  return (
    <div>
      <input id="todo" name="todo" onChange={(e: any) => setTodo(e.target.value)} />
      <button onClick={handleClick}>Add Todo</button>
      <div>{JSON.stringify(todos)}</div>
    </div>
  );
}

export default Todo;
```

[Contribute](https://github.com/codejamninja/use-state-cache/blob/master/CONTRIBUTING.md) usage docs

## Support

Submit an [issue](https://github.com/codejamninja/use-state-cache/issues/new)

## Screenshots

[Contribute](https://github.com/codejamninja/use-state-cache/blob/master/CONTRIBUTING.md) a screenshot

## Contributing

Review the [guidelines for contributing](https://github.com/codejamninja/use-state-cache/blob/master/CONTRIBUTING.md)

## License

[MIT License](https://github.com/codejamninja/use-state-cache/blob/master/LICENSE)

[Jam Risser](https://codejam.ninja) © 2020

## Changelog

Review the [changelog](https://github.com/codejamninja/use-state-cache/blob/master/CHANGELOG.md)

## Credits

- [Jam Risser](https://codejam.ninja) - Author

## Support on Liberapay

A ridiculous amount of coffee ☕ ☕ ☕ was consumed in the process of building this project.

[Add some fuel](https://liberapay.com/codejamninja/donate) if you'd like to keep me going!

[![Liberapay receiving](https://img.shields.io/liberapay/receives/codejamninja.svg?style=flat-square)](https://liberapay.com/codejamninja/donate)
[![Liberapay patrons](https://img.shields.io/liberapay/patrons/codejamninja.svg?style=flat-square)](https://liberapay.com/codejamninja/donate)
