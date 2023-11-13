import { Task } from './Types';
import AppComponent from './web-components';
import type { Ctx } from './Types';

// like jQuery
//const $ = (selector) =>
//  new Task((rej, res) => res(document.querySelector(selector)));

// for simplicity: rej are not handled

export const handleEventEffect = () =>
  new Task((rej, res) => {
    document.addEventListener('component-click', handler, { once: true });

    function handler(event: any) {
      res(event.detail);
    }
  });

export const getTodosEffect = () =>
  new Task((rej, res) => {
    res(JSON.parse(localStorage.getItem('todos') || '[]') as string[]);
  });

export const saveTodosEffect = ({ todos }: Ctx) =>
  new Task((rej, res) => {
    localStorage.setItem('todos', JSON.stringify(todos));
    res(true);
  });

export const removeTodoEffect = ({ idx, todos }: Ctx) =>
  new Task((rej, res) => {
    todos = todos.filter((_, i) => i != idx);
    res({ todos });
  });

export const renderAppEffect = (ctx: Ctx) =>
  new Task((rej, res) => {
    const app = new AppComponent(ctx)
    document.querySelector('#app')?.replaceChildren(app);
    res(true);
  });

