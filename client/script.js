// Combined bundle of client JS: api.js -> ui.js -> events.js -> app.js (priority removed)

// -------- api.js --------
const API_URL = "https://stunning-xylophone-jj9v6wj74xv3p479-5004.app.github.dev/todo";

async function fetchTodos() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Errore: ${response.status}`);
    const text = await response.text();
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Errore nel recupero dei todo:", error);
    throw error;
  }
}

async function createTodo(todoData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todoData)
    });
    if (!response.ok) throw new Error(`Errore: ${response.status}`);
    const text = await response.text();
    if (!text) return { id: Date.now().toString(), ...todoData };
    try {
      return JSON.parse(text);
    } catch {
      return { id: Date.now().toString(), ...todoData };
    }
  } catch (error) {
    console.error("Errore nella creazione:", error);
    throw error;
  }
}

async function updateTodo(id, todoData) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todoData)
    });
    if (!response.ok) throw new Error(`Errore: ${response.status}`);
    const text = await response.text();
    if (!text) return { id, ...todoData };
    try {
      return JSON.parse(text);
    } catch {
      return { id, ...todoData };
    }
  } catch (error) {
    console.error("Errore nell'aggiornamento:", error);
    throw error;
  }
}

async function deleteTodo(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`Errore: ${response.status}`);
    return { success: true, id };
  } catch (error) {
    console.error("Errore nell'eliminazione:", error);
    throw error;
  }
}

async function toggleTodoStatus(id, isComplete) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error(`Errore: ${response.status}`);
    const text = await response.text();
    const currentTodo = text ? JSON.parse(text) : {};
    return await updateTodo(id, { ...currentTodo, isComplete });
  } catch (error) {
    console.error("Errore nel toggle:", error);
    throw error;
  }
}

// -------- ui.js --------
const todoListElement = document.getElementById('todo-list');
const todoFormElement = document.getElementById('todo-form');
const todoInputElement = document.getElementById('todo-input');
// Priority element removed
const filterButtons = document.querySelectorAll('.filter-btn');
const totalTodosElement = document.getElementById('total-todos');
const completedTodosElement = document.getElementById('completed-todos');
const pendingTodosElement = document.getElementById('pending-todos');
const emptyStateElement = document.getElementById('empty-state');
const loadingElement = document.getElementById('loading');
const editModalElement = document.getElementById('edit-modal');
const editFormElement = document.getElementById('edit-form');

let currentFilter = 'all';

function getTodos() { return window.todos || []; }

function setLoading(isLoading) {
  if (isLoading) {
    loadingElement.classList.remove('hidden');
    todoListElement.innerHTML = '';
    emptyStateElement.classList.add('hidden');
  } else {
    loadingElement.classList.add('hidden');
  }
}

// Priority functions removed

function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = `todo-item ${todo.isComplete ? 'completed' : ''}`;
  li.dataset.id = todo.id;
  li.innerHTML = `
    <div class="todo-content">
      <input type="checkbox" class="todo-checkbox" ${todo.isComplete ? 'checked' : ''}>
      <span class="todo-name">${todo.name}</span>
      <!-- Priority span removed -->
    </div>
    <div class="todo-actions">
      <button class="btn btn-small btn-warning edit-btn" title="Modifica"><i class="fas fa-edit"></i></button>
      <button class="btn btn-small btn-danger delete-btn" title="Elimina"><i class="fas fa-trash"></i></button>
    </div>
  `;
  return li;
}

function renderTodos(todosToRender = null) {
  const todos = todosToRender || getTodos();
  let filteredTodos;
  switch (currentFilter) {
    case 'completed':
      filteredTodos = todos.filter(t => t.isComplete);
      break;
    case 'pending':
      filteredTodos = todos.filter(t => !t.isComplete);
      break;
    case 'all':
    default:
      filteredTodos = todos;
  }
  updateStats(todos);
  todoListElement.innerHTML = '';
  if (filteredTodos.length === 0) {
    emptyStateElement.classList.remove('hidden');
  } else {
    emptyStateElement.classList.add('hidden');
    filteredTodos.forEach(todo => todoListElement.appendChild(createTodoElement(todo)));
  }
}

function updateStats(todosList) {
  const total = todosList.length;
  const completed = todosList.filter(t => t.isComplete).length;
  totalTodosElement.textContent = total;
  completedTodosElement.textContent = completed;
  pendingTodosElement.textContent = total - completed;
}

function updateFilterButtons() {
  filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === currentFilter);
  });
}

function openEditModal(todo) {
  document.getElementById('edit-id').value = todo.id;
  document.getElementById('edit-name').value = todo.name;
  // Priority field removed
  document.getElementById('edit-isComplete').checked = todo.isComplete || false;
  editModalElement.classList.add('active');
  document.getElementById('edit-name').focus();
}

function closeEditModal() {
  editModalElement.classList.remove('active');
  editFormElement.reset();
}

function addTodoToList(todo) {
  const todos = getTodos();
  todos.unshift(todo);
  window.todos = todos;
  renderTodos();
}

// Fixed: use loose equality for ID matching
function updateTodoInList(updatedTodo) {
  const todos = getTodos();
  const index = todos.findIndex(t => t.id == updatedTodo.id);
  if (index !== -1) {
    todos[index] = updatedTodo;
    window.todos = todos;
    renderTodos();
  }
}

function removeTodoFromList(id) {
  const todos = getTodos();
  window.todos = todos.filter(t => t.id != id);
  renderTodos();
}

function setFilter(filter) {
  currentFilter = filter;
  updateFilterButtons();
  renderTodos();
}

function clearTodoForm() {
  todoFormElement.reset();
  // No priority to reset
  todoInputElement.focus();
}

// -------- events.js --------
function setupTodoListEvents() {
  document.getElementById('todo-list').addEventListener('click', async (e) => {
    const todoItem = e.target.closest('.todo-item');
    if (!todoItem) return;
    const todoId = todoItem.dataset.id;

    if (e.target.classList.contains('todo-checkbox')) {
      const isComplete = e.target.checked;
      try {
        const updated = await toggleTodoStatus(todoId, isComplete);
        updateTodoInList(updated);
      } catch (error) {
        console.error(error);
        e.target.checked = !isComplete;
      }
    } else if (e.target.closest('.edit-btn')) {
      const todo = getTodoById(todoId);
      if (todo) openEditModal(todo);
    } else if (e.target.closest('.delete-btn')) {
      if (confirm('Eliminare questa attività?')) {
        try {
          await deleteTodo(todoId);
          removeTodoFromList(todoId);
        } catch (error) {
          console.error(error);
          alert('Errore durante l\'eliminazione');
        }
      }
    }
  });
}

function setupTodoFormEvents() {
  todoFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = todoInputElement.value.trim();
    if (!name) {
      alert('Inserisci il nome');
      todoInputElement.focus();
      return;
    }
    // Priority removed from todoData
    try {
      const newTodo = await createTodo({ name, isComplete: false, categoryId: 1, listId: 1 });
      addTodoToList(newTodo);
      clearTodoForm();
    } catch (error) {
      console.error(error);
      alert('Errore nella creazione');
    }
  });
}

function setupFilterEvents() {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });
}

function setupEditModalEvents() {
  document.getElementById('close-modal').addEventListener('click', closeEditModal);
  document.getElementById('cancel-edit').addEventListener('click', closeEditModal);
  document.getElementById('edit-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeEditModal();
  });

  editFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value.trim();
    const isComplete = document.getElementById('edit-isComplete').checked;
    if (!name) {
      alert('Il nome è obbligatorio');
      return;
    }
    const existing = getTodoById(id) || {};
    try {
      // Merge all existing fields with the updated values
      const updated = await updateTodo(id, {
        ...existing,
        name,
        isComplete
      });
      updateTodoInList(updated);
      closeEditModal();
    } catch (error) {
      console.error("Errore nell'aggiornamento:", error);
      alert('Errore nell\'aggiornamento: ' + (error.message || ''));
    }
  });
}

function getTodoById(id) {
  return (window.todos || []).find(t => t.id == id);
}

// -------- app.js --------
window.todos = [];

async function initApp() {
  setupTodoListEvents();
  setupTodoFormEvents();
  setupFilterEvents();
  setupEditModalEvents();
  await loadTodos();
  setupReloadButton();
}

function setupReloadButton() {
  if (!document.getElementById('reload-btn')) {
    const btn = document.createElement('button');
    btn.id = 'reload-btn';
    btn.className = 'btn btn-secondary';
    btn.innerHTML = '<i class="fas fa-sync-alt"></i> Ricarica';
    btn.onclick = loadTodos;
    document.querySelector('header').appendChild(btn);
  }
}

async function loadTodos() {
  try {
    setLoading(true);
    const data = await fetchTodos();
    window.todos = data;
    renderTodos(data);
    showNotification(`Caricate ${data.length} attività`, 'success');
  } catch (error) {
    console.error(error);
    todoListElement.innerHTML = `<div class="error-message" style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <i class="fas fa-exclamation-triangle"></i> Errore nel caricamento: ${error.message}
      <div style="margin-top:10px"><button class="btn btn-primary" onclick="location.reload()">Ricarica pagina</button></div>
    </div>`;
    showNotification('Errore nel caricamento', 'error');
  } finally {
    setLoading(false);
  }
}

function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; padding: 15px 20px;
    background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
    color: ${type === 'success' ? '#155724' : '#721c24'};
    border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000; animation: slideIn 0.3s ease; max-width: 400px;
    border-left: 4px solid ${type === 'success' ? '#28a745' : '#dc3545'};
  `;
  notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
`;
document.head.appendChild(style);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

window.loadTodos = loadTodos;
window.app = { fetchTodos, createTodo, updateTodo, deleteTodo, toggleTodoStatus, renderTodos, setFilter };