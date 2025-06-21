/**
 * Implementación de una Máquina de Turing para operaciones binarias
 */

class TuringMachine {
    constructor() {
        this.tape = [];
        this.head = 0;
        this.state = 'q0';
        this.states = new Set();
        this.transitions = new Map();
        this.acceptStates = new Set();
        this.rejectStates = new Set();
        this.history = [];
        this.currentStep = 0;
    }

    /**
     * Inicializa la cinta con el contenido dado
     * @param {string} content - Contenido inicial de la cinta
     */
    initializeTape(content) {
        this.tape = content.split('');
        this.head = 0;
        this.state = 'q0';
        this.history = [];
        this.currentStep = 0;
        this.saveState('Inicialización de la cinta');
    }

    /**
     * Define una transición en la máquina
     * @param {string} fromState - Estado origen
     * @param {string} symbol - Símbolo leído
     * @param {string} toState - Estado destino
     * @param {string} writeSymbol - Símbolo a escribir
     * @param {string} direction - Dirección del cabezal ('L' o 'R')
     */
    addTransition(fromState, symbol, toState, writeSymbol, direction) {
        const key = `${fromState},${symbol}`;
        this.transitions.set(key, {
            state: toState,
            write: writeSymbol,
            move: direction
        });
        this.states.add(fromState);
        this.states.add(toState);
    }

    /**
     * Obtiene el símbolo actual bajo el cabezal
     * @returns {string} Símbolo actual o 'B' (blanco) si está fuera de los límites
     */
    getCurrentSymbol() {
        if (this.head < 0 || this.head >= this.tape.length) {
            return 'B'; // Símbolo blanco
        }
        return this.tape[this.head] || 'B';
    }

    /**
     * Escribe un símbolo en la posición actual
     * @param {string} symbol - Símbolo a escribir
     */
    writeSymbol(symbol) {
        // Extender la cinta si es necesario
        while (this.head >= this.tape.length) {
            this.tape.push('B');
        }
        if (this.head < 0) {
            // Extender hacia la izquierda
            const extension = Array(-this.head).fill('B');
            this.tape = extension.concat(this.tape);
            this.head = 0;
        }
        
        this.tape[this.head] = symbol;
    }

    /**
     * Mueve el cabezal en la dirección especificada
     * @param {string} direction - 'L' para izquierda, 'R' para derecha
     */
    moveHead(direction) {
        if (direction === 'L') {
            this.head--;
        } else if (direction === 'R') {
            this.head++;
        }
        // No hacer nada si la dirección no es válida
    }

    /**
     * Ejecuta un paso de la máquina
     * @returns {boolean} true si puede continuar, false si está en estado final
     */
    step() {
        const currentSymbol = this.getCurrentSymbol();
        const key = `${this.state},${currentSymbol}`;
        
        if (!this.transitions.has(key)) {
            // No hay transición definida, la máquina se detiene
            this.saveState(`No hay transición para (${this.state}, ${currentSymbol})`);
            return false;
        }
        
        const transition = this.transitions.get(key);
        
        // Ejecutar la transición
        this.writeSymbol(transition.write);
        this.moveHead(transition.move);
        this.state = transition.state;
        
        this.saveState(`Transición: (${key}) → ${transition.state}, escribir '${transition.write}', mover ${transition.move}`);
        
        // Verificar si está en un estado de aceptación o rechazo
        if (this.acceptStates.has(this.state) || this.rejectStates.has(this.state)) {
            return false;
        }
        
        return true;
    }

    /**
     * Ejecuta la máquina hasta que se detenga
     * @param {number} maxSteps - Número máximo de pasos (para evitar bucles infinitos)
     * @returns {boolean} true si terminó en estado de aceptación
     */
    run(maxSteps = 10000) {
        let steps = 0;
        while (steps < maxSteps && this.step()) {
            steps++;
        }
        
        if (steps >= maxSteps) {
            this.saveState('Se alcanzó el límite máximo de pasos');
            return false;
        }
        
        return this.acceptStates.has(this.state);
    }

    /**
     * Guarda el estado actual en el historial
     * @param {string} description - Descripción del paso
     */
    saveState(description) {
        this.history.push({
            step: this.history.length,
            tape: [...this.tape],
            head: this.head,
            state: this.state,
            description: description,
            timestamp: Date.now()
        });
    }

    /**
     * Restaura un estado del historial
     * @param {number} stepIndex - Índice del paso a restaurar
     */
    restoreState(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.history.length) {
            return false;
        }
        
        const savedState = this.history[stepIndex];
        this.tape = [...savedState.tape];
        this.head = savedState.head;
        this.state = savedState.state;
        this.currentStep = stepIndex;
        
        return true;
    }

    /**
     * Obtiene el contenido actual de la cinta como string
     * @returns {string} Contenido de la cinta
     */
    getTapeContent() {
        return this.tape.join('').replace(/B+$/, ''); // Remover blancos al final
    }

    /**
     * Añade estados de aceptación
     * @param {...string} states - Estados de aceptación
     */
    addAcceptStates(...states) {
        states.forEach(state => this.acceptStates.add(state));
    }

    /**
     * Añade estados de rechazo
     * @param {...string} states - Estados de rechazo
     */
    addRejectStates(...states) {
        states.forEach(state => this.rejectStates.add(state));
    }

    /**
     * Reinicia la máquina
     */
    reset() {
        this.tape = [];
        this.head = 0;
        this.state = 'q0';
        this.history = [];
        this.currentStep = 0;
    }

    /**
     * Obtiene información del estado actual
     * @returns {Object} Información del estado
     */
    getStatus() {
        return {
            tape: [...this.tape],
            head: this.head,
            state: this.state,
            currentSymbol: this.getCurrentSymbol(),
            isRunning: !this.acceptStates.has(this.state) && !this.rejectStates.has(this.state),
            isAccepted: this.acceptStates.has(this.state),
            isRejected: this.rejectStates.has(this.state),
            stepCount: this.history.length,
            currentStep: this.currentStep
        };
    }
}

// Función auxiliar para crear máquinas específicas
function createBinaryAdditionMachine() {
    const machine = new TuringMachine();
    
    // Estados de aceptación
    machine.addAcceptStates('qf');
    
    // Transiciones para suma binaria
    // Estas son transiciones simplificadas para demostración
    // En una implementación real, sería más complejo
    
    return machine;
}

// Exportar para uso en otros módulos
window.TuringMachine = TuringMachine;
window.createBinaryAdditionMachine = createBinaryAdditionMachine;