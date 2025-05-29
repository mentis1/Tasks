// Referencias a elementos del DOM
const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const taskTime = document.getElementById('taskTime'); 
const saveTaskButton = document.getElementById('saveTaskButton');
const taskList = document.getElementById('taskList');
const messageBox = document.getElementById('messageBox');
const toggleFormButton = document.getElementById('toggleFormButton');
const taskFormContainer = document.getElementById('taskFormContainer');
const taskListWrapper = document.getElementById('taskListWrapper');

// Array para almacenar las tareas
let tasks = [];
let isFormExpanded = false;

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
            tasks = []; 
        }
        renderTasks();
    } catch (e) {
        console.error("Error al cargar de localStorage:", e);
        showMessage("Error al cargar tareas. Es posible que los datos estén corruptos.");
        tasks = []; 
        renderTasks();
    }
}

/**
 * Renderiza las tareas en la lista, ordenadas por fecha y luego por hora.
 */
function renderTasks() {
    taskList.innerHTML = '';

    tasks.sort((a, b) => {
        const dateTimeA = a.date + (a.time ? 'T' + a.time : 'T00:00');
        const dateTimeB = b.date + (b.time ? 'T' + b.time : 'T00:00');

        const dateObjA = a.date ? new Date(dateTimeA) : new Date('9999-12-31T23:59:59'); 
        const dateObjB = b.date ? new Date(dateTimeB) : new Date('9999-12-31T23:59:59');

        if (dateObjA.getTime() === dateObjB.getTime()) {
            return a.id - b.id; 
        }
        return dateObjA - dateObjB; 
    });

    tasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.className = 'task-item';
        listItem.dataset.id = task.id;

        const taskContent = document.createElement('div');
        taskContent.className = 'task-item-content';

        const taskTextSpan = document.createElement('span');
        taskTextSpan.className = 'task-item-text';
        taskTextSpan.textContent = task.text;

        const taskDateTimeSpan = document.createElement('span');
        taskDateTimeSpan.className = 'task-item-date'; 
        taskDateTimeSpan.textContent = formatDateTime(task.date, task.time);

        taskContent.appendChild(taskTextSpan);
        taskContent.appendChild(taskDateTimeSpan);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', () => deleteTask(task.id));

        listItem.appendChild(taskContent);
        listItem.appendChild(deleteButton);
        taskList.appendChild(listItem);
    });
}

/**
 * Formatea una fecha y hora.
 * @param {string} dateString - La fecha en formato 'YYYY-MM-DD'.
 * @param {string} timeString - La hora en formato 'HH:MM'.
 * @returns {string} La fecha y/o hora formateada.
 */
function formatDateTime(dateString, timeString) {
    let output = '';
    if (dateString) {
        const [year, month, day] = dateString.split('-');
        output += `${day}/${month}/${year}`;
    }

    if (timeString) {
        if (output) { 
            output += ' '; 
        }
        output += timeString;
    }

    return output || 'Sin fecha/hora'; 
}


/**
 * Añade una nueva tarea a la lista.
 */
function addTask() {
    const text = taskInput.value.trim();
    const date = taskDate.value;
    const time = taskTime.value;

    if (text === '') {
        showMessage("Por favor, introduce una tarea.");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        date: date,
        time: time 
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    taskInput.value = '';
    taskDate.value = '';
    taskTime.value = ''; 
    toggleForm(); 
    showMessage("Tarea añadida.");

    // **NUEVO:** Asegurar que las clases se apliquen al añadir
    checkDateTimeInputState(taskDate);
    checkDateTimeInputState(taskTime);
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
        taskTime.value = ''; 
        // **NUEVO:** Al cerrar el formulario, asegurar que los inputs vuelvan a su estado "vacío"
        checkDateTimeInputState(taskDate);
        checkDateTimeInputState(taskTime);
    }
}

// **NUEVO FUNCIÓN:** Para gestionar la clase .empty-date-time
function checkDateTimeInputState(inputElement) {
    if (inputElement.value === '') {
        inputElement.classList.add('empty-date-time');
    } else {
        inputElement.classList.remove('empty-date-time');
    }
}

// Event Listeners
saveTaskButton.addEventListener('click', addTask);
toggleFormButton.addEventListener('click', toggleForm);

// **NUEVO:** Añadir event listeners para cambiar la clase al escribir/seleccionar
taskDate.addEventListener('change', () => checkDateTimeInputState(taskDate));
taskDate.addEventListener('input', () => checkDateTimeInputState(taskDate)); // Para asegurarse en tiempo real
taskTime.addEventListener('change', () => checkDateTimeInputState(taskTime));
taskTime.addEventListener('input', () => checkDateTimeInputState(taskTime)); // Para asegurarse en tiempo real


// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
    // Establecer la fecha mínima para el input de fecha (hoy)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    taskDate.min = `${year}-${month}-${day}`;

    // **NUEVO:** Llamar a la función para establecer el estado inicial de los inputs de fecha/hora
    checkDateTimeInputState(taskDate);
    checkDateTimeInputState(taskTime);
});