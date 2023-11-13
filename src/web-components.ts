class AppComponent extends HTMLElement {
  constructor(public ctx: any) {
    super();
    this.ctx = ctx;
  }

  connectedCallback() {
    this.render();
    // for simplicity: handle events here
    this.querySelector('#save')?.addEventListener(
      'click',
      this.onSaveClick.bind(this),
      {
        once: true,
      }
    );
    this.querySelectorAll('[data-identity="delete"]')?.forEach((el) =>
      el.addEventListener('click', this.onRemoveClick.bind(this), {
        once: true,
      })
    );
  }

  render() {
    if (this.ctx.page === 'create') {
      const createTodo = new CreateTodo();
      const todoList = new TodoList(this.ctx.todos);
      this.replaceChildren(createTodo, todoList);
    }
  }

  private onSaveClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    const todo = this.querySelector('input')?.value;

    if (todo && todo.length >= 1) {
      this.dispatchEvent(
        new CustomEvent('component-click', {
          bubbles: true,
          composed: true,
          detail: {
            todos: this.ctx.todos.concat(todo),
            route: 'save',
          },
        })
      );
    }
  }

  private onRemoveClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    this.dispatchEvent(
      new CustomEvent('component-click', {
        bubbles: true,
        composed: true,
        detail: {
          idx: (e.target as HTMLElement).dataset.idx,
          todos: this.ctx.todos,
          route: 'remove',
        },
      })
    );
  }

  disconnectedCallback() {}
}
class CreateTodo extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const inputField = document.createElement('input');
    const saveButton = document.createElement('button');
    saveButton.append('save');
    saveButton.id = 'save';

    this.append(inputField, saveButton);
  }
}

class TodoList extends HTMLElement {
  constructor(public todos: string[]) {
    super();
    this.todos = todos;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const todoList = this.todos.reduce(
      (acc, n, idx) =>
        acc.concat(
          `<li>
            ${n} 
            <button data-idx=${idx} data-identity='delete'>delete</button>
          </li>`
        ),
      ''
    );
    this.innerHTML = `<ul>${todoList}</ul>
    `;
  }
}

if (!customElements.get('app-component')) {
  customElements.define('app-component', AppComponent);
}
if (!customElements.get('todo-list')) {
  customElements.define('todo-list', TodoList);
}
if (!customElements.get('create-todo')) {
  customElements.define('create-todo', CreateTodo);
}

export default AppComponent;

