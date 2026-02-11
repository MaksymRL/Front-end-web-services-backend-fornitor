import { 
  createTodo, 
  updateTodo, 
  deleteTodo, 
  toggleTodoStatus 
} from './api.js';

import { 
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
} from './ui.js';

// Gestione eventi per la lista todo
export function setupTodoListEvents() {
  const todoListElement = document.getElementById('todo-list');
  
  // Gestione eventi delegati per i todo
  todoListElement.addEventListener('click', async (e) => {
    const todoItem = e.target.closest('.todo-item');
    if (!todoItem) return;
    
    const todoId = todoItem.dataset.id;
    
    // Click sul checkbox
    if (e.target.classList.contains('todo-checkbox')) {
      const isComplete = e.target.checked;
      
      try {
        await toggleTodoStatus(todoId, isComplete);
        updateTodoStatusInList(todoId, isComplete);
      } catch (error) {
        console.error("Errore nell'aggiornamento dello stato:", error);
        // Ripristina lo stato precedente
        e.target.checked = !isComplete;
      }
    }
    
    // Click sul bottone modifica
    if (e.target.closest('.edit-btn')) {
      const todo = getTodoById(todoId);
      if (todo) {
        openEditModal(todo);
      }
    }
    
    // Click sul bottone elimina
    if (e.target.closest('.delete-btn')) {
      if (confirm('Sei sicuro di voler eliminare questa attività?')) {
        try {
          await deleteTodo(todoId);
          removeTodoFromList(todoId);
        } catch (error) {
          console.error("Errore nell'eliminazione:", error);
          alert('Errore nell\'eliminazione dell\'attività');
        }
      }
    }
  });
}

// Gestione eventi per il form di aggiunta
export function setupTodoFormEvents() {
  todoFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = todoInputElement.value.trim();
    const priority = todoPriorityElement.value;
    
    if (!name) {
      alert('Inserisci il nome dell\'attività');
      todoInputElement.focus();
      return;
    }
    
    const todoData = {
      name,
      priority,
      isComplete: false
    };
    
    try {
      const newTodo = await createTodo(todoData);
      addTodoToList(newTodo);
      clearTodoForm();
    } catch (error) {
      console.error("Errore nella creazione:", error);
      alert('Errore nella creazione dell\'attività');
    }
  });
}

// Gestione eventi per i filtri
export function setupFilterEvents() {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      setFilter(filter);
    });
  });
}

// Gestione eventi per il modal di modifica
export function setupEditModalEvents() {
  const closeModalBtn = document.getElementById('close-modal');
  const cancelEditBtn = document.getElementById('cancel-edit');
  
  // Chiudi modal cliccando sul bottone X
  closeModalBtn.addEventListener('click', closeEditModal);
  
  // Chiudi modal cliccando sul bottone Annulla
  cancelEditBtn.addEventListener('click', closeEditModal);
  
  // Chiudi modal cliccando fuori dal contenuto
  const modal = document.getElementById('edit-modal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeEditModal();
    }
  });
  
  // Gestione submit del form di modifica
  editFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value.trim();
    const priority = document.getElementById('edit-priority').value;
    const isComplete = document.getElementById('edit-isComplete').checked;
    
    if (!name) {
      alert('Il nome dell\'attività è obbligatorio');
      document.getElementById('edit-name').focus();
      return;
    }
    
    const todoData = {
      name,
      priority,
      isComplete
    };
    
    try {
      const updatedTodo = await updateTodo(id, todoData);
      updateTodoInList(updatedTodo);
      closeEditModal();
    } catch (error) {
      console.error("Errore nell'aggiornamento:", error);
      alert('Errore nell\'aggiornamento dell\'attività');
    }
  });
}

// Funzione helper per recuperare un todo per ID
function getTodoById(id) {
  const todoList = JSON.parse(JSON.stringify(window.todos || []));
  return todoList.find(todo => todo.id == id);
}