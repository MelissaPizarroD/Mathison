/**
 * Implementación mejorada de una Máquina de Turing para operaciones binarias REALES
 * Optimizada para manejar algoritmos complejos con muchos estados y transiciones
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
        this.maxSteps = 10000; // Límite de seguridad
        this.debugMode = false;
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
        this.saveState('Inicialización de la cinta', content);
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
        
        // Verificar si ya existe una transición para este estado-símbolo
        if (this.transitions.has(key)) {
            console.warn(`⚠️ Transición sobrescrita: ${key}`);
        }
        
        this.transitions.set(key, {
            state: toState,
            write: writeSymbol,
            move: direction
        });
        
        this.states.add(fromState);
        this.states.add(toState);
        
        if (this.debugMode) {
            console.log(`➕ Transición agregada: (${fromState}, ${symbol}) → (${toState}, ${writeSymbol}, ${direction})`);
        }
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
        // Extender la cinta hacia la derecha si es necesario
        while (this.head >= this.tape.length) {
            this.tape.push('B');
        }
        
        // Extender hacia la izquierda si es necesario
        if (this.head < 0) {
            const extension = Array(-this.head).fill('B');
            this.tape = extension.concat(this.tape);
            this.head = 0;
        }
        
        this.tape[this.head] = symbol;
    }

    /**
     * Mueve el cabezal en la dirección especificada
     * @param {string} direction - 'L' para izquierda, 'R' para derecha, 'S' para no mover
     */
    moveHead(direction) {
        switch (direction) {
            case 'L':
                this.head--;
                break;
            case 'R':
                this.head++;
                break;
            case 'S':
                // No mover (útil para algunas operaciones)
                break;
            default:
                console.warn(`⚠️ Dirección de movimiento no válida: ${direction}`);
        }
    }

    /**
     * Ejecuta un paso de la máquina
     * @returns {Object} Información sobre el paso ejecutado
     */
    step() {
        const currentSymbol = this.getCurrentSymbol();
        const key = `${this.state},${currentSymbol}`;
        
        // Verificar si existe transición
        if (!this.transitions.has(key)) {
            const msg = `No hay transición para estado '${this.state}' con símbolo '${currentSymbol}'`;
            this.saveState(msg, this.getTapeContent());
            
            // Verificar si está en estado final
            if (this.acceptStates.has(this.state)) {
                return { success: true, halted: true, accepted: true, message: 'Aceptado' };
            } else if (this.rejectStates.has(this.state)) {
                return { success: true, halted: true, accepted: false, message: 'Rechazado' };
            } else {
                return { success: false, halted: true, accepted: false, message: msg };
            }
        }
        
        const transition = this.transitions.get(key);
        const oldState = this.state;
        const oldSymbol = currentSymbol;
        const oldHead = this.head;
        
        // Ejecutar la transición
        this.writeSymbol(transition.write);
        this.moveHead(transition.move);
        this.state = transition.state;
        
        // Guardar información detallada del paso
        const stepInfo = `δ(${oldState}, ${oldSymbol}) = (${this.state}, ${transition.write}, ${transition.move})`;
        this.saveState(stepInfo, this.getTapeContent());
        
        if (this.debugMode) {
            console.log(`🔄 Paso ${this.history.length - 1}: ${stepInfo}`);
            console.log(`   Cabezal: ${oldHead} → ${this.head}`);
            console.log(`   Cinta: ${this.getTapeContent()}`);
        }
        
        // Verificar estados finales
        if (this.acceptStates.has(this.state)) {
            return { success: true, halted: true, accepted: true, message: 'Máquina aceptó' };
        } else if (this.rejectStates.has(this.state)) {
            return { success: true, halted: true, accepted: false, message: 'Máquina rechazó' };
        }
        
        return { success: true, halted: false, accepted: false, message: 'Continuando' };
    }

    /**
     * Ejecuta la máquina hasta que se detenga o alcance el límite de pasos
     * @param {number} maxSteps - Número máximo de pasos
     * @returns {boolean} true si terminó en estado de aceptación
     */
    run(maxSteps = null) {
        const limit = maxSteps || this.maxSteps;
        let stepCount = 0;
        
        console.log(`🚀 Iniciando ejecución de Máquina de Turing`);
        console.log(`   Estado inicial: ${this.state}`);
        console.log(`   Cinta inicial: ${this.getTapeContent()}`);
        console.log(`   Posición cabezal: ${this.head}`);
        
        while (stepCount < limit) {
            const result = this.step();
            stepCount++;
            
            if (!result.success) {
                console.error(`❌ Error en paso ${stepCount}: ${result.message}`);
                this.saveState(`Error: ${result.message}`, this.getTapeContent());
                return false;
            }
            
            if (result.halted) {
                const finalResult = result.accepted;
                console.log(`🏁 Máquina detenida después de ${stepCount} pasos`);
                console.log(`   Estado final: ${this.state}`);
                console.log(`   Cinta final: ${this.getTapeContent()}`);
                console.log(`   Resultado: ${finalResult ? 'ACEPTADO' : 'RECHAZADO'}`);
                
                this.saveState(
                    `Fin de ejecución: ${result.message} (${stepCount} pasos)`, 
                    this.getTapeContent()
                );
                
                return finalResult;
            }
        }
        
        console.warn(`⚠️ Máquina alcanzó límite de ${limit} pasos sin detenerse`);
        this.saveState(`Límite de pasos alcanzado (${limit})`, this.getTapeContent());
        return false;
    }

    /**
     * Guarda el estado actual en el historial con información detallada
     * @param {string} description - Descripción del paso
     * @param {string} tapeSnapshot - Snapshot de la cinta (opcional)
     */
    saveState(description, tapeSnapshot = null) {
        const snapshot = {
            step: this.history.length,
            tape: [...this.tape],
            head: this.head,
            state: this.state,
            description: description,
            timestamp: Date.now(),
            tapeContent: tapeSnapshot || this.getTapeContent(),
            currentSymbol: this.getCurrentSymbol()
        };
        
        this.history.push(snapshot);
        
        if (this.debugMode && this.history.length % 10 === 0) {
            console.log(`📊 Paso ${snapshot.step}: ${description}`);
        }
    }

    /**
     * Restaura un estado del historial
     * @param {number} stepIndex - Índice del paso a restaurar
     */
    restoreState(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.history.length) {
            console.error(`❌ Índice de paso inválido: ${stepIndex}`);
            return false;
        }
        
        const savedState = this.history[stepIndex];
        this.tape = [...savedState.tape];
        this.head = savedState.head;
        this.state = savedState.state;
        this.currentStep = stepIndex;
        
        if (this.debugMode) {
            console.log(`⏪ Estado restaurado al paso ${stepIndex}`);
        }
        
        return true;
    }

    /**
     * Obtiene el contenido actual de la cinta como string
     * @returns {string} Contenido de la cinta limpio
     */
    getTapeContent() {
        let content = this.tape.join('');
        
        // Remover blancos al inicio y final, pero mantener estructura interna
        content = content.replace(/^B+/, ''); // Blancos al inicio
        content = content.replace(/B+$/, ''); // Blancos al final
        
        // Si queda vacío, devolver al menos un espacio
        return content || 'B';
    }

    /**
     * Obtiene representación visual de la cinta con el cabezal marcado
     * @returns {string} Representación visual
     */
    getVisualTape() {
        const tapeStr = this.tape.map((symbol, index) => {
            if (index === this.head) {
                return `[${symbol}]`; // Marcar posición del cabezal
            }
            return symbol === 'B' ? '_' : symbol;
        }).join(' ');
        
        return `Cinta: ${tapeStr}`;
    }

    /**
     * Añade estados de aceptación
     * @param {...string} states - Estados de aceptación
     */
    addAcceptStates(...states) {
        states.forEach(state => {
            this.acceptStates.add(state);
            this.states.add(state);
        });
        
        if (this.debugMode) {
            console.log(`✅ Estados de aceptación agregados: ${states.join(', ')}`);
        }
    }

    /**
     * Añade estados de rechazo
     * @param {...string} states - Estados de rechazo
     */
    addRejectStates(...states) {
        states.forEach(state => {
            this.rejectStates.add(state);
            this.states.add(state);
        });
        
        if (this.debugMode) {
            console.log(`❌ Estados de rechazo agregados: ${states.join(', ')}`);
        }
    }

    /**
     * Reinicia la máquina completamente
     */
    reset() {
        this.tape = [];
        this.head = 0;
        this.state = 'q0';
        this.history = [];
        this.currentStep = 0;
        
        if (this.debugMode) {
            console.log(`🔄 Máquina reiniciada`);
        }
    }

    /**
     * Obtiene información completa del estado actual
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
            currentStep: this.currentStep,
            totalStates: this.states.size,
            totalTransitions: this.transitions.size,
            tapeContent: this.getTapeContent(),
            visualTape: this.getVisualTape()
        };
    }

    /**
     * Habilita o deshabilita el modo debug
     * @param {boolean} enabled - Si habilitar debug
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`🔧 Modo debug ${enabled ? 'habilitado' : 'deshabilitado'}`);
    }

    /**
     * Obtiene estadísticas de la ejecución
     * @returns {Object} Estadísticas
     */
    getExecutionStats() {
        const stateChanges = new Map();
        const symbolsWritten = new Map();
        
        this.history.forEach(step => {
            // Contar cambios de estado
            const count = stateChanges.get(step.state) || 0;
            stateChanges.set(step.state, count + 1);
            
            // Contar símbolos en la cinta
            step.tape.forEach(symbol => {
                const symbolCount = symbolsWritten.get(symbol) || 0;
                symbolsWritten.set(symbol, symbolCount + 1);
            });
        });
        
        return {
            totalSteps: this.history.length,
            statesVisited: stateChanges.size,
            stateFrequency: Object.fromEntries(stateChanges),
            symbolFrequency: Object.fromEntries(symbolsWritten),
            finalState: this.state,
            finalTapeLength: this.tape.length,
            finalHeadPosition: this.head
        };
    }

    /**
     * Valida que la máquina esté bien formada
     * @returns {Object} Resultado de validación
     */
    validateMachine() {
        const issues = [];
        
        // Verificar que hay al menos un estado de aceptación
        if (this.acceptStates.size === 0) {
            issues.push('No hay estados de aceptación definidos');
        }
        
        // Verificar que el estado inicial está definido
        if (!this.states.has('q0')) {
            issues.push('Estado inicial q0 no está definido');
        }
        
        // Verificar transiciones huérfanas
        this.transitions.forEach((transition, key) => {
            const [fromState] = key.split(',');
            if (!this.states.has(fromState)) {
                issues.push(`Estado origen ${fromState} no está definido`);
            }
            if (!this.states.has(transition.state)) {
                issues.push(`Estado destino ${transition.state} no está definido`);
            }
        });
        
        return {
            valid: issues.length === 0,
            issues: issues,
            stats: {
                states: this.states.size,
                transitions: this.transitions.size,
                acceptStates: this.acceptStates.size,
                rejectStates: this.rejectStates.size
            }
        };
    }

    /**
     * Exporta la configuración de la máquina
     * @returns {Object} Configuración exportable
     */
    exportConfiguration() {
        const transitions = {};
        this.transitions.forEach((value, key) => {
            transitions[key] = value;
        });
        
        return {
            states: Array.from(this.states),
            acceptStates: Array.from(this.acceptStates),
            rejectStates: Array.from(this.rejectStates),
            transitions: transitions,
            initialState: 'q0'
        };
    }

    /**
     * Importa una configuración de máquina
     * @param {Object} config - Configuración a importar
     */
    importConfiguration(config) {
        this.reset();
        
        // Cargar estados
        config.states.forEach(state => this.states.add(state));
        config.acceptStates.forEach(state => this.acceptStates.add(state));
        config.rejectStates.forEach(state => this.rejectStates.add(state));
        
        // Cargar transiciones
        Object.entries(config.transitions).forEach(([key, value]) => {
            this.transitions.set(key, value);
        });
        
        console.log(`📥 Configuración importada: ${this.states.size} estados, ${this.transitions.size} transiciones`);
    }
}

// Función auxiliar para crear máquinas de ejemplo
function createSimpleBinaryAdditionExample() {
    const machine = new TuringMachine();
    
    // Máquina simple que suma 1+1=10 (ejemplo educativo)
    machine.initializeTape('1#1##');
    machine.addAcceptStates('qf');
    
    // Transiciones básicas de ejemplo
    machine.addTransition('q0', '1', 'q1', '1', 'R');
    machine.addTransition('q1', '#', 'q2', '#', 'R');
    machine.addTransition('q2', '1', 'q3', '1', 'R');
    machine.addTransition('q3', '#', 'q4', '#', 'R');
    machine.addTransition('q4', '#', 'q5', '1', 'R');
    machine.addTransition('q5', 'B', 'qf', '0', 'S');
    
    return machine;
}

// Exportar para uso en otros módulos
window.TuringMachine = TuringMachine;
window.createSimpleBinaryAdditionExample = createSimpleBinaryAdditionExample;