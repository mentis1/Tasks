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
 * Actualiza el texto de un botón de fecha/hora basado en si tiene valor o no.
 */
function updateDateTimeButtonText(button, textElement, value, defaultText) {
    if (value) {
        button.classList.add('has-value');
        if (defaultText.includes('fecha')) {
            const date = new Date(value + 'T00:00:00');
            textElement.textContent = date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } else {
            // Para la hora, mostrar en formato 12 horas si es posible
            const [hours, minutes] = value.split(':');
            const hour24 = parseInt(hours);
            const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
            const period = hour24 >= 12 ? 'PM' : 'AM';
            textElement.textContent = `${hour12}:${minutes} ${period}`;
        }
    } else {
        button.classList.remove('has-value');
        textElement.textContent = defaultText;
    }
}

/**
 * Formatea la fecha y hora para mostrar en la tarea.
 */
function formatDateTime(dateString, timeString) {
    if (!dateString && !timeString) {
        return 'Sin fecha/hora';
    }

    let result = '';
    
    if (dateString) {
        const date = new Date(dateString + 'T00:00:00');
        result += date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
    
    if (timeString) {
        if (result) result += ' a las ';
        const [hours, minutes] = timeString.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const period = hour24 >= 12 ? 'PM' : 'AM';
        result += `${hour12}:${minutes} ${period}`;
    }
    
    return result || 'Sin fecha/hora';
}

/**
 * Renderiza las tareas en la lista ordenadas por fecha/hora.
 */
function renderTasks() {
    taskList.innerHTML = '';

    // Ordenar las tareas por fecha y hora (más próximas primero)
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
        // Se ha quitado la línea: deleteButton.innerHTML = `<svg>...</svg>`;
        deleteButton.addEventListener('click', () => deleteTask(task.id));

        listItem.appendChild(taskContent);
        listItem.appendChild(deleteButton);
        taskList.appendChild(listItem);
    });
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
    
    // Actualizar textos de botones
    updateDateTimeButtonText(dateButton, dateButtonText, '', 'Establecer fecha');
    updateDateTimeButtonText(timeButton, timeButtonText, '', 'Establecer hora');
    
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
        taskTime.value = ''; 
        
        // Resetear textos de botones
        updateDateTimeButtonText(dateButton, dateButtonText, '', 'Establecer fecha');
        updateDateTimeButtonText(timeButton, timeButtonText, '', 'Establecer hora');
    }
}

// Event Listeners
saveTaskButton.addEventListener('click', addTask);
toggleFormButton.addEventListener('click', toggleForm);

// Event listeners para los botones - activan los inputs nativos
dateButton.addEventListener('click', (e) => {
    e.preventDefault();
    taskDate.focus();
    taskDate.click();
});

timeButton.addEventListener('click', (e) => {
    e.preventDefault();
    taskTime.focus();
    taskTime.click();
});

// Event listeners para cuando cambian los valores - se guardan automáticamente
taskDate.addEventListener('change', () => {
    updateDateTimeButtonText(dateButton, dateButtonText, taskDate.value, 'Establecer fecha');
});

taskTime.addEventListener('change', () => {
    updateDateTimeButtonText(timeButton, timeButtonText, taskTime.value, 'Establecer hora');
});

// Event listeners adicionales para iOS/Safari
taskDate.addEventListener('input', () => {
    updateDateTimeButtonText(dateButton, dateButtonText, taskDate.value, 'Establecer fecha');
});

taskTime.addEventListener('input', () => {
    updateDateTimeButtonText(timeButton, timeButtonText, taskTime.value, 'Establecer hora');
});

// Para compatibilidad con iOS, también escuchar eventos de blur
taskDate.addEventListener('blur', () => {
    updateDateTimeButtonText(dateButton, dateButtonText, taskDate.value, 'Establecer fecha');
});

taskTime.addEventListener('blur', () => {
    updateDateTimeButtonText(timeButton, timeButtonText, taskTime.value, 'Establecer hora');
});

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
    // Establecer fecha mínima como hoy
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    taskDate.min = `${year}-${month}-${day}`;

    // Inicializar textos de botones
    updateDateTimeButtonText(dateButton, dateButtonText, taskDate.value, 'Establecer fecha');
    updateDateTimeButtonText(timeButton, timeButtonText, taskTime.value, 'Establecer hora');
});