import { fetchTodos } from './api.js';
import { setLoading, renderTodos } from './ui.js';
import { 
  setupTodoListEvents, 
  setupTodoFormEvents, 
  setupFilterEvents, 
  setupEditModalEvents 
} from './events.js';

// Espone i todo globalmente per debug
window.todos = [];

/**
 * Inizializza l'applicazione
 */
async function initApp() {
  console.log('Inizializzazione Todo App...');
  
  // Setup event listeners
  setupTodoListEvents();
  setupTodoFormEvents();
  setupFilterEvents();
  setupEditModalEvents();
  
  // Carica i todo all'avvio
  await loadTodos();
  
  // Setup pulsante di ricarica manuale
  setupReloadButton();
  
  console.log('Todo App inizializzata con successo!');
}

/**
 * Setup del pulsante di ricarica manuale
 */
function setupReloadButton() {
  // Aggiungi un pulsante di ricarica se non esiste già
  if (!document.getElementById('reload-btn')) {
    const header = document.querySelector('header');
    const reloadBtn = document.createElement('button');
    reloadBtn.id = 'reload-btn';
    reloadBtn.className = 'btn btn-secondary';
    reloadBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Ricarica';
    reloadBtn.onclick = loadTodos;
    header.appendChild(reloadBtn);
  }
}

/**
 * Carica i todo dal server
 */
async function loadTodos() {
  try {
    setLoading(true);
    const todosData = await fetchTodos();
    window.todos = todosData;
    renderTodos(todosData);
    
    // Mostra notifica di successo
    showNotification(`Caricate ${todosData.length} attività`, 'success');
    
  } catch (error) {
    console.error("Errore nel caricamento iniziale:", error);
    
    // Mostra messaggio di errore in pagina
    const errorHtml = `
      <div class="error-message" style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <i class="fas fa-exclamation-triangle"></i>
        <h3 style="margin: 10px 0;">Errore nel caricamento</h3>
        <p style="margin-bottom: 15px;">Impossibile caricare le attività dal server.</p>
        <p style="font-size: 0.9em; margin-bottom: 15px;">Errore: ${error.message}</p>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary" onclick="location.reload()">Ricarica pagina</button>
          <button class="btn btn-secondary" onclick="loadTodos()">Riprova</button>
        </div>
      </div>
    `;
    
    document.getElementById('todo-list').innerHTML = errorHtml;
    showNotification('Errore nel caricamento delle attività', 'error');
    
  } finally {
    setLoading(false);
  }
}

/**
 * Mostra una notifica temporanea
 */
function showNotification(message, type = 'info') {
  // Rimuovi notifiche precedenti
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Crea nuova notifica
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
    color: ${type === 'success' ? '#155724' : '#721c24'};
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    animation: slideIn 0.3s ease;
    max-width: 400px;
    border-left: 4px solid ${type === 'success' ? '#28a745' : '#dc3545'};
  `;
  
  notification.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    <span style="margin-left: 10px;">${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Rimuovi dopo 3 secondi
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Aggiungi stili per le animazioni delle notifiche
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Inizializza l'app quando il DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Espone loadTodos globalmente per debug
window.loadTodos = loadTodos;