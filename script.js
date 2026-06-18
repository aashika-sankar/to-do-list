// --- STATE MANAGEMENT ---
let todos = JSON.parse(localStorage.getItem('todo_app_state')) || [];
let currentFilter = 'all';

// --- DOM ELEMENTS ---
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

// --- APP CORE ACTIONS ---

function saveState() {
    localStorage.setItem('todo_app_state', JSON.stringify(todos));
    updateMetrics();
}

function addTodo(text) {
    const newTodo = {
        id: crypto.randomUUID(), // Production-ready deterministic tracking mechanism
        text: text,
        completed: false
    };
    todos.push(newTodo);
    saveState();
    render();
}

function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveState();
    render();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveState();
    render();
}

// --- METRICS ENGINE ---
function updateMetrics() {
    const total = todos.length;
    const completedCount = todos.filter(t => t.completed).length;
    
    // Compute percentage using basic programmatic bounds checks
    const percentage = total === 0 ? 0 : (completedCount / total) * 100;
    
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${completedCount} of ${total} tasks completed`;
}

// --- RENDER PIPELINE ---
function render() {
    todoList.innerHTML = '';

    // Filter array algorithmically based on reactive filter setting
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true; // 'all'
    });

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `<li class="todo-item" style="justify-content: center; color: var(--text-muted); font-size: 0.9rem;">No tasks found</li>`;
        return;
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="todo-content">
                <div class="checkbox">
                    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span class="todo-text">${escapeHTML(todo.text)}</span>
            </div>
            <button class="delete-action" aria-label="Delete Task">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;

        // Event hooks using closures safely targeting execution scope
        li.querySelector('.todo-content').addEventListener('click', () => toggleTodo(todo.id));
        li.querySelector('.delete-action').addEventListener('click', () => deleteTodo(todo.id));

        todoList.appendChild(li);
    });
}

// --- SECURITY SANITIZATION ---
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// --- LISTENERS & INITIALIZATION ---

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
        addTodo(text);
        todoInput.value = '';
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        render();
    });
});

clearCompletedBtn.addEventListener('click', () => {
    todos = todos.filter(todo => !todo.completed);
    saveState();
    render();
});

// Bootstrap Setup execution
updateMetrics();
render();