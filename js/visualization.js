/**
 * Manejo de la visualización de la Máquina de Turing
 */

class TuringVisualization {
    constructor() {
        this.currentMachine = null;
        this.currentStep = 0;
        this.autoPlayInterval = null;
        this.isAutoPlaying = false;
        this.animationSpeed = 800;
        
        // Elementos del DOM
        this.tapeElement = document.getElementById('tape');
        this.tapeHeadElement = document.getElementById('tape-head');
        this.currentOperationElement = document.getElementById('current-operation');
        this.currentStateElement = document.getElementById('current-state');
        this.headPositionElement = document.getElementById('head-position');
        this.stepsLogElement = document.getElementById('steps-log');
        this.resultBinaryElement = document.getElementById('result-binary');
        this.resultDecimalElement = document.getElementById('result-decimal');
        
        this.initializeEventListeners();
    }
    
    /**
     * Inicializa los event listeners
     */
    initializeEventListeners() {
        // Controles de navegación
        document.getElementById('prev-step').addEventListener('click', () => this.previousStep());
        document.getElementById('next-step').addEventListener('click', () => this.nextStep());
        document.getElementById('auto-play').addEventListener('click', () => this.toggleAutoPlay());
        
        // Control de velocidad
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
            if (this.isAutoPlaying) {
                this.restartAutoPlay();
            }
        });
    }
    
    /**
     * Carga una nueva máquina para visualizar
     * @param {TuringMachine} machine - Máquina de Turing
     * @param {string} operation - Descripción de la operación
     */
    loadMachine(machine, operation = '') {
        this.currentMachine = machine;
        this.currentStep = 0;
        this.currentOperationElement.textContent = operation;
        
        this.stopAutoPlay();
        this.updateDisplay();
        this.updateControls();
        this.updateStepsLog();
    }
    
    /**
     * Actualiza la visualización completa
     */
    updateDisplay() {
        if (!this.currentMachine) return;
        
        this.updateTape();
        this.updateMachineStatus();
    }
    
    /**
     * Actualiza la visualización de la cinta
     */
    updateTape() {
        if (!this.currentMachine) return;
        
        const currentState = this.getCurrentMachineState();
        const tape = currentState.tape;
        const headPosition = currentState.head;
        
        // Limpiar cinta
        this.tapeElement.innerHTML = '';
        
        // Determinar rango de celdas a mostrar
        const minIndex = Math.min(0, headPosition - 10);
        const maxIndex = Math.max(tape.length - 1, headPosition + 10);
        
        // Crear celdas
        for (let i = minIndex; i <= maxIndex; i++) {
            const cell = document.createElement('div');
            cell.className = 'tape-cell';
            
            // Contenido de la celda
            let content = '';
            if (i >= 0 && i < tape.length) {
                content = tape[i] || 'B';
            } else {
                content = 'B';
            }
            
            cell.textContent = content;
            
            // Marcar celda actual
            if (i === headPosition) {
                cell.classList.add('current');
            }
            
            // Marcar celdas vacías
            if (content === 'B') {
                cell.classList.add('empty');
            }
            
            this.tapeElement.appendChild(cell);
        }
        
        // Posicionar cabezal
        this.updateTapeHead(headPosition, minIndex);
    }
    
    /**
     * Actualiza la posición del cabezal de la cinta
     * @param {number} headPosition - Posición del cabezal
     * @param {number} minIndex - Índice mínimo mostrado
     */
    updateTapeHead(headPosition, minIndex) {
        const cellWidth = 52; // 50px + 2px border
        const offset = (headPosition - minIndex) * cellWidth + cellWidth / 2 - 12; // 12px es la mitad del ancho del cabezal
        this.tapeHeadElement.style.left = `${offset}px`;
    }
    
    /**
     * Actualiza el estado de la máquina en la interfaz
     */
    updateMachineStatus() {
        if (!this.currentMachine) return;
        
        const currentState = this.getCurrentMachineState();
        
        this.currentStateElement.textContent = currentState.state;
        this.headPositionElement.textContent = currentState.head.toString();
    }
    
    /**
     * Obtiene el estado actual de la máquina basado en el paso actual
     * @returns {Object} Estado de la máquina
     */
    getCurrentMachineState() {
        if (!this.currentMachine || this.currentMachine.history.length === 0) {
            return {
                tape: [],
                head: 0,
                state: 'q0'
            };
        }
        
        const stepIndex = Math.min(this.currentStep, this.currentMachine.history.length - 1);
        return this.currentMachine.history[stepIndex];
    }
    
    /**
     * Actualiza el log de pasos
     */
    updateStepsLog() {
        if (!this.currentMachine) {
            this.stepsLogElement.innerHTML = '<p class="no-steps">No hay pasos registrados aún</p>';
            return;
        }
        
        const history = this.currentMachine.history;
        if (history.length === 0) {
            this.stepsLogElement.innerHTML = '<p class="no-steps">No hay pasos registrados aún</p>';
            return;
        }
        
        this.stepsLogElement.innerHTML = '';
        
        history.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'step-entry';
            
            if (index === this.currentStep) {
                stepElement.classList.add('current');
            }
            
            stepElement.innerHTML = `
                <strong>Paso ${step.step}:</strong> ${step.description}<br>
                <small>Estado: ${step.state} | Posición: ${step.head} | Cinta: [${step.tape.join(', ')}]</small>
            `;
            
            stepElement.addEventListener('click', () => {
                this.goToStep(index);
            });
            
            this.stepsLogElement.appendChild(stepElement);
        });
        
        // Scroll al paso actual
        const currentStepElement = this.stepsLogElement.querySelector('.step-entry.current');
        if (currentStepElement) {
            currentStepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    /**
     * Actualiza el estado de los controles
     */
    updateControls() {
        const hasHistory = this.currentMachine && this.currentMachine.history.length > 0;
        const canGoPrev = hasHistory && this.currentStep > 0;
        const canGoNext = hasHistory && this.currentStep < this.currentMachine.history.length - 1;
        
        document.getElementById('prev-step').disabled = !canGoPrev;
        document.getElementById('next-step').disabled = !canGoNext;
        document.getElementById('auto-play').disabled = !hasHistory;
        document.getElementById('step-btn').disabled = !hasHistory;
    }
    
    /**
     * Va al paso anterior
     */
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateDisplay();
            this.updateControls();
            this.updateStepsLog();
        }
    }
    
    /**
     * Va al paso siguiente
     */
    nextStep() {
        if (this.currentMachine && this.currentStep < this.currentMachine.history.length - 1) {
            this.currentStep++;
            this.updateDisplay();
            this.updateControls();
            this.updateStepsLog();
        }
    }
    
    /**
     * Va a un paso específico
     * @param {number} stepIndex - Índice del paso
     */
    goToStep(stepIndex) {
        if (this.currentMachine && stepIndex >= 0 && stepIndex < this.currentMachine.history.length) {
            this.currentStep = stepIndex;
            this.updateDisplay();
            this.updateControls();
            this.updateStepsLog();
        }
    }
    
    /**
     * Activa/desactiva la reproducción automática
     */
    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }
    
    /**
     * Inicia la reproducción automática
     */
    startAutoPlay() {
        if (!this.currentMachine || this.currentMachine.history.length === 0) return;
        
        this.isAutoPlaying = true;
        document.getElementById('auto-play').textContent = '⏸ Pausar';
        
        this.autoPlayInterval = setInterval(() => {
            if (this.currentStep < this.currentMachine.history.length - 1) {
                this.nextStep();
            } else {
                this.stopAutoPlay();
            }
        }, this.animationSpeed);
    }
    
    /**
     * Detiene la reproducción automática
     */
    stopAutoPlay() {
        this.isAutoPlaying = false;
        document.getElementById('auto-play').textContent = '▶ Auto';
        
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    /**
     * Reinicia la reproducción automática con nueva velocidad
     */
    restartAutoPlay() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
            this.startAutoPlay();
        }
    }
    
    /**
     * Actualiza el resultado mostrado
     * @param {Object} result - Resultado de la operación
     */
    updateResult(result) {
        if (result && result.binary && result.decimal !== undefined) {
            this.resultBinaryElement.textContent = result.binary;
            this.resultDecimalElement.textContent = result.decimal;
        } else {
            this.resultBinaryElement.textContent = '-';
            this.resultDecimalElement.textContent = '-';
        }
    }
    
    /**
     * Limpia toda la visualización
     */
    clear() {
        this.currentMachine = null;
        this.currentStep = 0;
        this.stopAutoPlay();
        
        this.tapeElement.innerHTML = '';
        this.currentOperationElement.textContent = '-';
        this.currentStateElement.textContent = 'q0';
        this.headPositionElement.textContent = '0';
        this.stepsLogElement.innerHTML = '<p class="no-steps">No hay pasos registrados aún</p>';
        this.resultBinaryElement.textContent = '-';
        this.resultDecimalElement.textContent = '-';
        
        this.updateControls();
    }
    
    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje de error
     */
    showError(message) {
        this.stepsLogElement.innerHTML = `
            <div class="error-message" style="color: #f56565; padding: 15px; background: #fed7d7; border-radius: 8px;">
                <strong>Error:</strong> ${message}
            </div>
        `;
    }
}

// Exportar para uso global
window.TuringVisualization = TuringVisualization;