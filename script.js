// Referencias a elementos del DOM
const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate'); // Input de fecha oculto
const taskTime = document.getElementById('taskTime'); // Input de hora oculto
const saveTaskButton = document.getElementById('saveTaskButton');
const taskList = document.getElementById('taskList');
const messageBox = document.getElementById('messageBox');
const toggleFormButton = document.getElementById('toggleFormButton');
const taskFormContainer = document.getElementById('taskFormContainer');
const taskListWrapper = document.getElementById('taskListWrapper');

// Nuevas referencias a los botones de fecha y hora y sus textos
const dateButton = document.getElementById('dateButton');
const timeButton = document.getElementById('timeButton');
const dateButtonText = document.getElementById('dateButtonText');
const timeButtonText = document.getElementById('timeButtonText');


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
    const date = taskDate.value; // Obtener valor del input oculto
    const time = taskTime.value; // Obtener valor del input oculto

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
    taskDate.value = ''; // Limpiar input oculto
    taskTime.value = ''; // Limpiar input oculto
    
    // Resetear textos de los botones al añadir la tarea
    updateDateTimeButtonText(dateButton, dateButtonText, taskDate.value, 'Establecer fecha');
    updateDateTimeButtonText(timeButton, timeButtonText, taskTime.value, 'Establecer hora');

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
        taskDate.value = ''; // Limpiar input oculto
        taskTime.value = ''; // Limpiar input oculto
        // Resetear textos de los botones al cerrar el formulario
        updateDateTimeButtonText(dateButton, dateButtonText, taskDate.value, 'Establecer fecha');
        updateDateTimeButtonText(timeButton, timeButtonText, taskTime.value, 'Establecer hora');
    }
}

/**
 * Actualiza el texto de un botón de fecha/hora.
 * @param {HTMLElement} buttonElement - El elemento del botón (dateButton/timeButton).
 * @param {HTMLElement} textElement - El elemento span que contiene el texto (dateButtonText/timeButtonText).
 * @param {string} value - El valor actual del input (fecha o hora).
 * @param {string} defaultText - El texto predeterminado si el valor está vacío.
 */
function updateDateTimeButtonText(buttonElement, textElement, value, defaultText) {
    if (value) {
        if (buttonElement.id === 'dateButton') {
            const [year, month, day] = value.split('-');
            textElement.textContent = `${day}/${month}/${year}`;
        } else if (buttonElement.id === 'timeButton') {
            textElement.textContent = value;
        }
        buttonElement.classList.add('has-value');
    } else {
        textElement.textContent = defaultText;
        buttonElement.classList.remove('has-value');
    }
}


// Event Listeners
saveTaskButton.addEventListener('click', addTask);
toggleFormButton.addEventListener('click', toggleForm);

// Listener para el botón de fecha: activa el input de fecha oculto
dateButton.addEventListener('click', () => {
    taskDate.showPicker(); // Esto abre el selector de fecha nativo
});

// Listener para el botón de hora: activa el input de hora oculto
timeButton.addEventListener('click', () => {
    taskTime.showPicker(); // Esto abre el selector de hora nativo
});

// Listeners para los inputs ocultos: actualizan el texto del botón cuando cambia su valor
taskDate.addEventListener('change', () => {
    updateDateTimeButtonText(dateButton, dateButtonText, taskDate.value, 'Establecer fecha');
});

taskTime.addEventListener('change', () => {
    updateDateTimeButtonText(timeButton, timeButtonText, taskTime.value, 'Establecer hora');
});


// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
    // Establecer la fecha mínima para el input de fecha (hoy)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    taskDate.min = `${year}-${month}-${day}`;

    // Inicializar el texto de los botones al cargar
    updateDateTimeButtonText(dateButton, dateButtonText, taskDate.value, 'Establecer fecha');
    updateDateTimeButtonText(timeButton, timeButtonText, taskTime.value, 'Establecer hora');
});