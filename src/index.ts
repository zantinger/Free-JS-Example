import {
  Id,
  Task,
  Free,
  Impure,
  Pure,
  RenderApp,
  HandleEvent,
  GetTodos,
  SaveTodos,
  RemoveTodo
} from './Types';
import { renderAppEffect, handleEventEffect, getTodosEffect, saveTodosEffect, removeTodoEffect, } from './effects';
import { program } from './program';

const mockEvents = [
  { route: 'save', todos: ['some todo'] },
  { route: 'end' },
].reverse();

const compilerTest = (free: any) =>
  Task.of(
    free
      .foldMap(<U>(subject: (val: U) => Free<any>) => {
        switch (true) {
          case subject instanceof RenderApp:
            return Id.of('render component');
          case subject instanceof HandleEvent:
            return Id.of(mockEvents.pop());
          case subject instanceof GetTodos:
            return Id.of(['first todo']);
            case subject instanceof SaveTodos:
              return Id.of(true);
          default:
            throw Error();
        }
      }, Id.of)
      .extract()
  );

const compilerReal = (free: any) =>
  free.foldMap((subject:any) => {
    switch (true) {
      case subject instanceof RenderApp:
        return renderAppEffect(subject.ctx);
      case subject instanceof HandleEvent:
        return handleEventEffect();
      case subject instanceof GetTodos:
        return getTodosEffect();
        case subject instanceof SaveTodos:
          return saveTodosEffect(subject.ctx);
        case subject instanceof RemoveTodo:
          return removeTodoEffect(subject.ctx);
      default:
        throw Error();
    }
  }, Task.of);

const runProgram = (free: any, compiler: any, log = []) => {
  if (free instanceof Pure) {
    // @ts-ignore
    return log.concat([free.x]);
  } else if (free instanceof Impure) {
    return compiler(free).fork(Id.of, (g: any) => {
      // @ts-ignore
      return runProgram(g, compiler, log.concat([free.x]));
    });
  }
};

localStorage.setItem('todos', '["clean up room"]');

const res = runProgram(program({route: 'start'}), compilerReal);
// const res = runProgram(program({ route: 'start' }), compilerTest);
console.log(res);

