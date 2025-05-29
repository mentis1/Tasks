// Referencias a elementos del DOM
const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const saveTaskButton = document.getElementById('saveTaskButton');
const taskList = document.getElementById('taskList');
const messageBox = document.getElementById('messageBox');
const toggleFormButton = document.getElementById('toggleFormButton');
const taskFormContainer = document.getElementById('taskFormContainer');
const taskListWrapper = document.getElementById('taskListWrapper');

// Array para almacenar las tareas
let tasks = [];
let isFormExpanded = false;

// **SECCIÓN ELIMINADA:** Datos de ejemplo para mostrar el diseño
// const sampleTasks = [
//     { id: 1, text: "Recoger a los niños", date: "2025-05-29" },
//     { id: 2, text: "Comprar pan", date: "2025-05-30" },
//     { id: 3, text: "Entrevista de trabajo", date: "2025-05-31" },
//     { id: 4, text: "Hacer la comida", date: "2025-06-01" },
//     { id: 5, text: "Recoger iPhone", date: "2025-06-02" }
// ];

/**
 * Muestra un mensaje temporal en la pantalla.
 * @param {string} message - El mensaje a mostrar.
 */
function showMessage(message) {
    messageBox.textContent = message;
    messageBox.classList.add('show');
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 2000);
}

/**
 * Guarda las tareas en el almacenamiento local.
 */
function saveTasks() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (e) {
        console.error("Error al guardar en localStorage:", e);
        showMessage("Error al guardar tareas. El almacenamiento puede estar lleno o deshabilitado.");
    }
}

/**
 * Carga las tareas del almacenamiento local.
 */
function loadTasks() {
    try {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        } else {
            // Si no hay tareas guardadas, simplemente se inicializa el array vacío.
            // **AJUSTE:** Eliminada la carga de sampleTasks aquí.
            tasks = []; 
        }
        renderTasks(); // Renderiza las tareas, ya sean las cargadas o una lista vacía.
    } catch (e) {
        console.error("Error al cargar de localStorage:", e);
        showMessage("Error al cargar tareas. Es posible que los datos estén corruptos.");
        tasks = []; // Asegurarse de que el array esté vacío en caso de error grave
        renderTasks();
    }
}

/**
 * Renderiza las tareas en la lista, ordenadas por fecha.
 */
function renderTasks() {
    // Limpiar la lista actual
    taskList.innerHTML = '';

    // Ordenar tareas: las más próximas primero, luego por orden de creación si las fechas son iguales.
    // Las tareas sin fecha van al final.
    tasks.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date('9999-12-31');
        const dateB = b.date ? new Date(b.date) : new Date('9999-12-31');

        if (dateA.getTime() === dateB.getTime()) {
            return a.id - b.id;
        }
        return dateA - dateB;
    });

    // Crear elementos de lista para cada tarea
    tasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.className = 'task-item';
        listItem.dataset.id = task.id;

        const taskContent = document.createElement('div');
        taskContent.className = 'task-item-content';

        const taskTextSpan = document.createElement('span');
        taskTextSpan.className = 'task-item-text';
        taskTextSpan.textContent = task.text;

        const taskDateSpan = document.createElement('span');
        taskDateSpan.className = 'task-item-date';
        taskDateSpan.textContent = task.date ? formatDate(task.date) : 'Sin fecha';

        taskContent.appendChild(taskTextSpan);
        taskContent.appendChild(taskDateSpan);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', () => deleteTask(task.id));

        listItem.appendChild(taskContent);
        listItem.appendChild(deleteButton);
        taskList.appendChild(listItem);
    });
}

/**
 * Formatea una fecha de 'YYYY-MM-DD' a 'DD/MM/YYYY'.
 * @param {string} dateString - La fecha en formato 'YYYY-MM-DD'.
 * @returns {string} La fecha formateada.
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Añade una nueva tarea a la lista.
 */
function addTask() {
    const text = taskInput.value.trim();
    const date = taskDate.value;

    if (text === '') {
        showMessage("Por favor, introduce una tarea.");
        return;
    }

    // Crea un ID único para la tarea
    const newTask = {
        id: Date.now(),
        text: text,
        date: date
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    // Limpia los campos de entrada y oculta el formulario
    taskInput.value = '';
    taskDate.value = '';
    toggleForm();
    showMessage("Tarea añadida.");
}

/**
 * Elimina una tarea por su ID.
 * @param {number} id - El ID de la tarea a eliminar.
 */
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    showMessage("Tarea eliminada.");
}

/**
 * Muestra u oculta el formulario de añadir tarea con animación.
 */
function toggleForm() {
    isFormExpanded = !isFormExpanded;

    if (isFormExpanded) {
        taskFormContainer.classList.remove('hidden-form');
        taskFormContainer.classList.add('expanded-form');
        taskInput.focus();
    } else {
        taskFormContainer.classList.remove('expanded-form');
        taskFormContainer.classList.add('hidden-form');
        taskInput.value = '';
        taskDate.value = '';
    }
}

// Event Listeners
saveTaskButton.addEventListener('click', addTask);
toggleFormButton.addEventListener('click', toggleForm);

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
    // Establecer la fecha mínima para el input de fecha (hoy)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    taskDate.min = `${year}-${month}-${day}`;
});