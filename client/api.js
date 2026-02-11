// URL del tuo endpoint Codespace
const API_URL = "https://humble-xylophone-4jqgwxgj7x962j56r-5004.app.github.dev/todo";

// Funzioni CRUD per l'API Todo

/**
 * Recupera tutti i todo dal server
 * @returns {Promise<Array>} Array di todo
 */
async function fetchTodos() {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`Errore nella richiesta: ${response.status}`);
    }
    
    const todos = await response.json();
    return todos;
  } catch (error) {
    console.error("Errore nel recupero dei todo:", error);
    throw error;
  }
}

/**
 * Crea un nuovo todo
 * @param {Object} todoData - Dati del todo da creare
 * @returns {Promise<Object>} Todo creato
 */
async function createTodo(todoData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData)
    });
    
    if (!response.ok) {
      throw new Error(`Errore nella creazione: ${response.status}`);
    }
    
    const newTodo = await response.json();
    return newTodo;
  } catch (error) {
    console.error("Errore nella creazione del todo:", error);
    throw error;
  }
}

/**
 * Aggiorna un todo esistente
 * @param {string|number} id - ID del todo da aggiornare
 * @param {Object} todoData - Dati aggiornati del todo
 * @returns {Promise<Object>} Todo aggiornato
 */
async function updateTodo(id, todoData) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData)
    });
    
    if (!response.ok) {
      throw new Error(`Errore nell'aggiornamento: ${response.status}`);
    }
    
    const updatedTodo = await response.json();
    return updatedTodo;
  } catch (error) {
    console.error("Errore nell'aggiornamento del todo:", error);
    throw error;
  }
}

/**
 * Elimina un todo
 * @param {string|number} id - ID del todo da eliminare
 * @returns {Promise<Object>} Risposta del server
 */
async function deleteTodo(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Errore nell'eliminazione: ${response.status}`);
    }
    
    return { success: true, id };
  } catch (error) {
    console.error("Errore nell'eliminazione del todo:", error);
    throw error;
  }
}

/**
 * Aggiorna solo lo stato di completamento di un todo
 * @param {string|number} id - ID del todo
 * @param {boolean} isComplete - Nuovo stato di completamento
 * @returns {Promise<Object>} Todo aggiornato
 */
async function toggleTodoStatus(id, isComplete) {
  try {
    // Prima recuperiamo il todo corrente
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Errore nel recupero del todo: ${response.status}`);
    }
    
    const currentTodo = await response.json();
    
    // Poi aggiorniamo solo il campo isComplete
    return await updateTodo(id, {
      ...currentTodo,
      isComplete
    });
  } catch (error) {
    console.error("Errore nel toggle dello stato del todo:", error);
    throw error;
  }
}

export { 
  fetchTodos, 
  createTodo, 
  updateTodo, 
  deleteTodo, 
  toggleTodoStatus 
};