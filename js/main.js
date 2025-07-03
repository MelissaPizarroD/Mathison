// js/main.js

// Variable global para la máquina actual
let currentMachine = null;
let currentOperation = 'sum';

// Función para actualizar la descripción del algoritmo
function updateAlgorithmDescription(operation) {
    const description = algorithmDescriptions[operation];
    const titleElement = document.querySelector('.algorithm-description h3');
    const stepsElement = document.getElementById('algorithmSteps');
    
    titleElement.textContent = description.title;
    stepsElement.innerHTML = '';
    
    description.steps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        stepsElement.appendChild(li);
    });
}

// Función para cambiar de operación
function changeOperation(operation) {
    currentOperation = operation;
    
    // Actualizar botones activos
    document.querySelectorAll('.operation-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-operation="${operation}"]`).classList.add('active');
    
    // Actualizar descripción del algoritmo
    updateAlgorithmDescription(operation);
    
    // Resetear la máquina
    resetMachine();
    
    // Actualizar placeholders según la operación
    updateInputPlaceholders(operation);
}

// Función para actualizar placeholders de entrada
function updateInputPlaceholders(operation) {
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    
    switch (operation) {
        case 'sum':
            num1Input.placeholder = '1011';
            num2Input.placeholder = '101';
            num1Input.value = '1011';
            num2Input.value = '101';
            break;
        case 'subtract':
            num1Input.placeholder = '1100';
            num2Input.placeholder = '101';
            num1Input.value = '1100';
            num2Input.value = '101';
            break;
        case 'multiply':
            num1Input.placeholder = '101';
            num2Input.placeholder = '11';
            num1Input.value = '101';
            num2Input.value = '11';
            break;
        case 'divide':
            num1Input.placeholder = '1010';
            num2Input.placeholder = '11';
            num1Input.value = '1010';
            num2Input.value = '11';
            break;
    }
}

// Función para crear la máquina según la operación
function createMachine(operation) {
    switch (operation) {
        case 'sum':
            return new SumTuringMachine();
        case 'subtract':
            return new SubtractTuringMachine();
        case 'multiply':
            return new MultiplyTuringMachine();
        case 'divide':
            // return new DivideTuringMachine();
            alert('Operación de división en desarrollo');
            return null;
        default:
            return new SumTuringMachine();
    }
}

// Función principal para inicializar la máquina
function initializeMachine() {
    const num1 = document.getElementById('num1').value.trim();
    const num2 = document.getElementById('num2').value.trim();
    
    // Ocultar alertas previas
    hideAlert();
    
    // Crear nueva máquina según la operación seleccionada
    currentMachine = createMachine(currentOperation);
    
    if (!currentMachine) {
        return;
    }
    
    if (currentMachine.initialize(num1, num2)) {
        updateDisplay();
        document.getElementById('stepBtn').disabled = false;
        document.getElementById('runBtn').disabled = false;
    }
}

// Función para mostrar alertas
function showAlert(message) {
    const alertContainer = document.getElementById('alertContainer');
    const alertMessage = document.getElementById('alertMessage');
    
    alertMessage.textContent = message;
    alertContainer.style.display = 'block';
}

// Función para ocultar alertas
function hideAlert() {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.style.display = 'none';
}

// Función para actualizar la visualización
function updateDisplay() {
    if (!currentMachine) return;
    
    const tapeElement = document.getElementById('tape');
    tapeElement.innerHTML = '';
    
    for (let i = 0; i < currentMachine.tape.length; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = currentMachine.tape[i] === '#' ? '∅' : currentMachine.tape[i];
        
        if (currentMachine.tape[i] === '#') {
            cell.classList.add('empty');
        }
        
        if (i === currentMachine.head) {
            cell.classList.add('head');
        }
        
        tapeElement.appendChild(cell);
    }
    
    // Actualizar estado actual
    const stateElement = document.getElementById('state');
    stateElement.textContent = currentMachine.state;
    
    // Actualizar posición
    document.getElementById('position').textContent = currentMachine.head;
    
    // Mostrar carry/borrow en su propio elemento (tercer cuadro)
    const carryElement = document.getElementById('carry');
    
    if (currentMachine.carry !== undefined) {
        carryElement.textContent = currentMachine.carry;
    } else if (currentMachine.borrow !== undefined) {
        carryElement.textContent = currentMachine.borrow;
    } else {
        carryElement.textContent = '-';
    }
    
    document.getElementById('stepCount').textContent = currentMachine.stepCount;
    
    // Actualizar visualización de pasos
    const stepDisplay = document.getElementById('stepDisplay');
    stepDisplay.innerHTML = '';
    
    for (let i = Math.max(0, currentMachine.steps.length - 10); i < currentMachine.steps.length; i++) {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step';
        if (i === currentMachine.steps.length - 1) {
            stepDiv.classList.add('current-step');
        }
        stepDiv.textContent = `Paso ${currentMachine.steps[i].step}: ${currentMachine.steps[i].description}`;
        stepDisplay.appendChild(stepDiv);
    }
    
    stepDisplay.scrollTop = stepDisplay.scrollHeight;
    
    // Verificar si hay algún mensaje especial en el último paso
    if (currentMachine.steps.length > 0) {
        const lastStep = currentMachine.steps[currentMachine.steps.length - 1];
        if (lastStep.description.includes('¡Este número es negativo!')) {
            showAlert('⚠️ ¡Este número es negativo! En este ejercicio académico no se representarán números binarios negativos por complemento a dos.');
        }
    }
}

// Función para ejecutar un paso
function stepForward() {
    if (!currentMachine || currentMachine.state === 'COMPLETO') return;
    
    currentMachine.executeStep();
    updateDisplay();
    
    if (currentMachine.state === 'COMPLETO') {
        document.getElementById('stepBtn').disabled = true;
        document.getElementById('runBtn').disabled = true;
    }
}

// Función para ejecutar automáticamente
function runAutomatic() {
    if (!currentMachine || currentMachine.running) return;
    
    currentMachine.running = true;
    document.getElementById('runBtn').disabled = true;
    document.getElementById('stepBtn').disabled = true;
    
    const speed = parseInt(document.getElementById('speed').value);
    
    const runStep = () => {
        if (currentMachine.state !== 'COMPLETO' && currentMachine.running) {
            currentMachine.executeStep();
            updateDisplay();
            setTimeout(runStep, speed);
        } else {
            currentMachine.running = false;
            document.getElementById('runBtn').disabled = currentMachine.state === 'COMPLETO';
            document.getElementById('stepBtn').disabled = currentMachine.state === 'COMPLETO';
        }
    };
    
    runStep();
}

// Función para resetear la máquina
function resetMachine() {
    if (currentMachine) {
        currentMachine.running = false;
    }
    currentMachine = null;
    
    // Ocultar alertas
    hideAlert();
    
    document.getElementById('stepBtn').disabled = true;
    document.getElementById('runBtn').disabled = true;
    document.getElementById('stepDisplay').innerHTML = '';
    
    const tapeElement = document.getElementById('tape');
    tapeElement.innerHTML = '<div class="cell empty">Listo para inicializar...</div>';
    
    document.getElementById('state').textContent = 'LISTO';
    document.getElementById('position').textContent = '-';
    document.getElementById('carry').textContent = '0';
    document.getElementById('stepCount').textContent = '0';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Configurar botones de operación
    document.querySelectorAll('.operation-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            changeOperation(this.dataset.operation);
        });
    });
    
    // Control de velocidad
    document.getElementById('speed').addEventListener('input', function() {
        document.getElementById('speedValue').textContent = this.value + 'ms';
    });
    
    // Permitir tecla Enter para inicializar
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && (!currentMachine || !currentMachine.running)) {
            initializeMachine();
        }
    });
    
    // Inicializar con suma por defecto
    changeOperation('sum');
    resetMachine();
});