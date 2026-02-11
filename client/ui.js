import { toggleTodoStatus, deleteTodo } from './api.js';

// Elementi DOM principali
const todoListElement = document.getElementById('todo-list');
const todoFormElement = document.getElementById('todo-form');
const todoInputElement = document.getElementById('todo-input');
const todoPriorityElement = document.getElementById('todo-priority');
const filterButtons = document.querySelectorAll('.filter-btn');
const totalTodosElement = document.getElementById('total-todos');
const completedTodosElement = document.getElementById('completed-todos');
const pendingTodosElement = document.getElementById('pending-todos');
const emptyStateElement = document.getElementById('empty-state');
const loadingElement = document.getElementById('loading');
const editModalElement = document.getElementById('edit-modal');
const editFormElement = document.getElementById('edit-form');

// Stato dell'applicazione
let todos = [];
let currentFilter = 'all';

/**
 * Mostra o nasconde lo stato di caricamento
 * @param {boolean} isLoading - Se true, mostra il caricamento
 */
function setLoading(isLoading) {
  if (isLoading) {
    loadingElement.classList.remove('hidden');
    todoListElement.innerHTML = '';
    emptyStateElement.classList.add('hidden');
  } else {
    loadingElement.classList.add('hidden');
  }
}

/**
 * Formatta la priorità per la visualizzazione
 * @param {string} priority - Priorità del todo
 * @returns {string} Classe CSS per la priorità
 */
function getPriorityClass(priority) {
  switch (priority) {
    case 'alta': return 'priority-high';
    case 'media': return 'priority-medium';
    case 'bassa': return 'priority-low';
    default: return 'priority-medium';
  }
}

/**
 * Formatta la priorità per la visualizzazione
 * @param {string} priority - Priorità del todo
 * @returns {string} Testo formattato per la priorità
 */
function formatPriority(priority) {
  switch (priority) {
    case 'alta': return 'Alta';
    case 'media': return 'Media';
    case 'bassa': return 'Bassa';
    default: return 'Media';
  }
}

/**
 * Crea un elemento todo per il DOM
 * @param {Object} todo - Oggetto todo
 * @returns {HTMLElement} Elemento DOM del todo
 */
function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = `todo-item ${todo.isComplete ? 'completed' : ''}`;
  li.dataset.id = todo.id;
  
  // Determina l'icona in base allo stato
  const statusIcon = todo.isComplete ? 'fas fa-check-circle' : 'far fa-circle';
  
  li.innerHTML = `
    <div class="todo-content">
      <input 
        type="checkbox" 
        class="todo-checkbox" 
        ${todo.isComplete ? 'checked' : ''}
        title="${todo.isComplete ? 'Completata' : 'Da completare'}"
      >
      <span class="todo-name">${todo.name}</span>
      <span class="todo-priority ${getPriorityClass(todo.priority)}">
        ${formatPriority(todo.priority)}
      </span>
    </div>
    <div class="todo-actions">
      <button class="btn btn-small btn-warning edit-btn" title="Modifica">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn btn-small btn-danger delete-btn" title="Elimina">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
  
  return li;
}

/**
 * Renderizza la lista dei todo nel DOM
 * @param {Array} todosToRender - Array di todo da visualizzare
 */
function renderTodos(todosToRender = todos) {
  // Filtra i todo in base al filtro corrente
  let filteredTodos = todosToRender;
  
  switch (currentFilter) {
    case 'completed':
      filteredTodos = todosToRender.filter(todo => todo.isComplete);
      break;
    case 'pending':
      filteredTodos = todosToRender.filter(todo => !todo.isComplete);
      break;
    case 'high':
      filteredTodos = todosToRender.filter(todo => todo.priority === 'alta');
      break;
    case 'all':
    default:
      filteredTodos = todosToRender;
  }
  
  // Aggiorna le statistiche
  updateStats(todosToRender);
  
  // Pulisce la lista
  todoListElement.innerHTML = '';
  
  // Mostra/nasconde lo stato vuoto
  if (filteredTodos.length === 0) {
    emptyStateElement.classList.remove('hidden');
    
    // Personalizza il messaggio in base al filtro
    const emptyStateTitle = emptyStateElement.querySelector('h3');
    const emptyStateMessage = emptyStateElement.querySelector('p');
    
    if (todosToRender.length === 0) {
      emptyStateTitle.textContent = 'Nessuna attività';
      emptyStateMessage.textContent = 'Aggiungi la tua prima attività usando il form qui sopra!';
    } else {
      emptyStateTitle.textContent = 'Nessuna attività corrisponde al filtro';
      emptyStateMessage.textContent = 'Prova a cambiare filtro o aggiungi nuove attività';
    }
  } else {
    emptyStateElement.classList.add('hidden');
    
    // Aggiunge ogni todo alla lista
    filteredTodos.forEach(todo => {
      const todoElement = createTodoElement(todo);
      todoListElement.appendChild(todoElement);
    });
  }
}

/**
 * Aggiorna le statistiche
 * @param {Array} todosList - Array di todo
 */
function updateStats(todosList) {
  const total = todosList.length;
  const completed = todosList.filter(todo => todo.isComplete).length;
  const pending = total - completed;
  
  totalTodosElement.textContent = total;
  completedTodosElement.textContent = completed;
  pendingTodosElement.textContent = pending;
}

/**
 * Aggiorna i bottoni di filtro attivi
 */
function updateFilterButtons() {
  filterButtons.forEach(btn => {
    if (btn.dataset.filter === currentFilter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * Apre il modal di modifica con i dati del todo
 * @param {Object} todo - Oggetto todo da modificare
 */
function openEditModal(todo) {
  document.getElementById('edit-id').value = todo.id;
  document.getElementById('edit-name').value = todo.name;
  document.getElementById('edit-priority').value = todo.priority || 'media';
  document.getElementById('edit-isComplete').checked = todo.isComplete || false;
  
  editModalElement.classList.add('active');
  document.getElementById('edit-name').focus();
}

/**
 * Chiude il modal di modifica
 */
function closeEditModal() {
  editModalElement.classList.remove('active');
  editFormElement.reset();
}

/**
 * Aggiunge un todo alla lista e lo renderizza
 * @param {Object} todo - Oggetto todo da aggiungere
 */
function addTodoToList(todo) {
  // Aggiunge il todo all'inizio dell'array
  todos.unshift(todo);
  renderTodos();
}

/**
 * Aggiorna un todo nella lista
 * @param {Object} updatedTodo - Oggetto todo aggiornato
 */
function updateTodoInList(updatedTodo) {
  const index = todos.findIndex(todo => todo.id === updatedTodo.id);
  if (index !== -1) {
    todos[index] = updatedTodo;
    renderTodos();
  }
}

/**
 * Rimuove un todo dalla lista
 * @param {string|number} id - ID del todo da rimuovere
 */
function removeTodoFromList(id) {
  todos = todos.filter(todo => todo.id !== id);
  renderTodos();
}

/**
 * Aggiorna lo stato di completamento di un todo nella lista
 * @param {string|number} id - ID del todo
 * @param {boolean} isComplete - Nuovo stato di completamento
 */
function updateTodoStatusInList(id, isComplete) {
  const todo = todos.find(todo => todo.id === id);
  if (todo) {
    todo.isComplete = isComplete;
    renderTodos();
  }
}

/**
 * Imposta il filtro corrente
 * @param {string} filter - Tipo di filtro ('all', 'completed', 'pending', 'high')
 */
function setFilter(filter) {
  currentFilter = filter;
  updateFilterButtons();
  renderTodos();
}

/**
 * Pulisce il form di input
 */
function clearTodoForm() {
  todoFormElement.reset();
  todoPriorityElement.value = 'media';
  todoInputElement.focus();
}

// Espone le funzioni pubbliche
export {
  setLoading,
  renderTodos,
  openEditModal,
  closeEditModal,
  addTodoToList,
  updateTodoInList,
  removeTodoFromList,
  updateTodoStatusInList,
  setFilter,
  clearTodoForm,
  todoInputElement,
  todoPriorityElement,
  todoFormElement,
  filterButtons,
  editFormElement
};