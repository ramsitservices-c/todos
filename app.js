/* Simple Todo app using localStorage
   - add, edit, delete todos
   - toggle complete
   - filter (all/active/completed)
   - persist in localStorage
*/

const STORAGE_KEY = 'todos.v1';
let todos = [];
let currentFilter = 'all';

const $ = (sel) => document.querySelector(sel);
const $all = (sel) => document.querySelectorAll(sel);

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    todos = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load todos', e);
    todos = [];
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  todos.unshift({ id: uid(), text: trimmed, completed: false, createdAt: Date.now() });
  save();
  render();
}

function updateTodo(id, fields) {
  const t = todos.find((x) => x.id === id);
  if (!t) return;
  Object.assign(t, fields);
  save();
  render();
}

function removeTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  save();
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  save();
  render();
}

function filteredTodos() {
  if (currentFilter === 'active') return todos.filter((t) => !t.completed);
  if (currentFilter === 'completed') return todos.filter((t) => t.completed);
  return todos;
}

function render() {
  const list = $('#todo-list');
  list.innerHTML = '';
  const template = $('#todo-item-template');

  const items = filteredTodos();
  if (items.length === 0) {
    list.innerHTML = '<li class="empty">No todos yet.</li>';
  } else {
    for (const todo of items) {
      const node = template.content.firstElementChild.cloneNode(true);
      const checkbox = node.querySelector('.toggle');
      const textSpan = node.querySelector('.text');
      const editBtn = node.querySelector('.edit');
      const deleteBtn = node.querySelector('.delete');

      checkbox.checked = !!todo.completed;
      textSpan.textContent = todo.text;
      if (todo.completed) node.classList.add('completed');

      checkbox.addEventListener('change', () => updateTodo(todo.id, { completed: checkbox.checked }));
      deleteBtn.addEventListener('click', () => {
        if (confirm('Delete this todo?')) removeTodo(todo.id);
      });
      editBtn.addEventListener('click', () => startEdit(node, todo));

      list.appendChild(node);
    }
  }

  $('#stats').textContent = `${todos.filter(t => !t.completed).length} active · ${todos.filter(t => t.completed).length} completed`;
  updateFilterButtons();
}

function updateFilterButtons() {
  $all('.filter').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === currentFilter));
}

function startEdit(node, todo) {
  const textSpan = node.querySelector('.text');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = todo.text;

  node.classList.add('editing');
  textSpan.replaceWith(input);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  function finish(saveEdit) {
    node.classList.remove('editing');
    if (saveEdit) {
      const val = input.value.trim();
      if (val) updateTodo(todo.id, { text: val });
    }
    render();
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finish(true);
    if (e.key === 'Escape') finish(false);
  });
  input.addEventListener('blur', () => finish(true));
}

function setupEventHandlers() {
  const form = $('#todo-form');
  const input = $('#todo-input');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo(input.value);
    input.value = '';
    input.focus();
  });

  $all('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  $('#clear-completed').addEventListener('click', () => {
    if (confirm('Remove all completed todos?')) clearCompleted();
  });
}

function init() {
  load();
  setupEventHandlers();
  render();
}

document.addEventListener('DOMContentLoaded', init);