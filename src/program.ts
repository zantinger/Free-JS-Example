import {
  liftF,
  Free,
  RenderApp,
  HandleEvent,
  GetTodos,
  SaveTodos,
  RemoveTodo,
} from './Types';
import { compose2, compose3, map, chain } from './utils';
import type { Ctx } from './Types';

const renderApp = compose2(liftF, RenderApp.of);

const getTodos = compose2(liftF, GetTodos.of);

const saveTodos = compose2(liftF, SaveTodos.of);

const removeTodo = compose2(liftF, RemoveTodo.of);

const handleRouting = (event: any): Free<any> =>
  // @ts-ignore
  programRoutes[event.route](event);

const handleEvent = compose2(liftF, HandleEvent.of);

const rendering = compose3(map(handleRouting), chain(handleEvent), renderApp);

const start = compose3(
  map(rendering),
  map((todos: Ctx) => ({ todos, page: 'create' })),
  getTodos
);

const save = compose2(map(start), saveTodos);

const remove = compose2(map(save), removeTodo);

const end = () => Free.Pure('close');

const programRoutes = {
  start,
  save,
  remove,
  end,
};

const program = handleRouting;

export { program };

