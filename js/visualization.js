/**
 * Visualización mejorada para Máquinas de Turing REALES
 * Optimizada para mostrar ejecuciones auténticas paso a paso
 */

class TuringVisualization {
    constructor() {
        this.currentMachine = null;
        this.currentStep = 0;
        this.autoPlayInterval = null;
        this.isAutoPlaying = false;
        this.animationSpeed = 800;
        this.highlightTransitions = true;
        this.showSymbolDetails = true;
        this.autoScrollEnabled = false; // Por defecto deshabilitado
        this.autoScrollOnlyDuringAutoPlay = true; // Solo scroll durante auto-play
        
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
        this.addVisualizationEnhancements();
    }
    
    /**
     * Añade mejoras visuales para máquinas reales
     */
    addVisualizationEnhancements() {
        // Añadir información adicional al estado de la máquina
        const machineStatus = document.querySelector('.machine-status');
        if (machineStatus) {
            const additionalInfo = document.createElement('div');
            additionalInfo.className = 'additional-machine-info';
            additionalInfo.innerHTML = `
                <div class="status-item">
                    <span class="label">Símbolo Actual:</span>
                    <span id="current-symbol" class="value">-</span>
                </div>
                <div class="status-item">
                    <span class="label">Transición:</span>
                    <span id="current-transition" class="value">-</span>
                </div>
                <div class="status-item">
                    <span class="label">Paso:</span>
                    <span id="current-step-display" class="value">0/0</span>
                </div>
            `;
            machineStatus.appendChild(additionalInfo);
        }
        
        // Añadir leyenda de símbolos
        this.addSymbolLegend();
        
        // Añadir controles de scroll automático
        this.addScrollControls();
    }
    
    /**
     * Añadir controles de scroll automático
     */
    addScrollControls() {
        const controls = document.querySelector('.controls');
        if (controls) {
            const scrollControls = document.createElement('div');
            scrollControls.className = 'scroll-controls';
            scrollControls.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                margin-left: 10px;
            `;
            
            const scrollToggle = document.createElement('button');
            scrollToggle.className = 'control-btn scroll-toggle';
            scrollToggle.style.cssText = `
                padding: 8px 12px;
                font-size: 0.9rem;
                background: ${this.autoScrollEnabled ? '#38a169' : '#a0aec0'};
            `;
            scrollToggle.textContent = this.autoScrollEnabled ? '📜 Scroll ON' : '📜 Scroll OFF';
            
            scrollToggle.addEventListener('click', () => {
                this.autoScrollEnabled = !this.autoScrollEnabled;
                scrollToggle.style.background = this.autoScrollEnabled ? '#38a169' : '#a0aec0';
                scrollToggle.textContent = this.autoScrollEnabled ? '📜 Scroll ON' : '📜 Scroll OFF';
                
                console.log(`📜 Scroll automático ${this.autoScrollEnabled ? 'habilitado' : 'deshabilitado'}`);
            });
            
            scrollToggle.setAttribute('title', 'Habilitar/deshabilitar scroll automático al historial durante navegación');
            
            scrollControls.appendChild(scrollToggle);
            controls.appendChild(scrollControls);
        }
    }
    addSymbolLegend() {
        const tapeContainer = document.querySelector('.tape-container');
        if (tapeContainer) {
            const legend = document.createElement('div');
            legend.className = 'symbol-legend';
            legend.style.cssText = `
                margin-top: 10px;
                padding: 10px;
                background: #edf2f7;
                border-radius: 8px;
                font-size: 0.9rem;
            `;
            legend.innerHTML = `
                <h4 style="margin: 0 0 8px 0; font-size: 1rem;">📖 Leyenda de Símbolos:</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
                    <span><strong>0, 1:</strong> Dígitos binarios</span>
                    <span><strong>#:</strong> Separador</span>
                    <span><strong>X, Y:</strong> Marcadores</span>
                    <span><strong>B:</strong> Blanco/vacío</span>
                    <span><strong>+, -, *, /:</strong> Operadores</span>
                    <span><strong>C:</strong> Acarreo</span>
                </div>
            `;
            tapeContainer.appendChild(legend);
        }
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
            this.updateSpeedDisplay();
            if (this.isAutoPlaying) {
                this.restartAutoPlay();
            }
        });
        
        // Teclas de navegación
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return; // No interferir con inputs
            
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousStep();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextStep();
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAutoPlay();
                    break;
            }
        });
    }
    
    /**
     * Actualiza la visualización de velocidad
     */
    updateSpeedDisplay() {
        const speedLabel = document.querySelector('.speed-label');
        if (speedLabel) {
            const speed = this.animationSpeed;
            let speedText = 'Normal';
            if (speed <= 200) speedText = 'Muy Rápido';
            else if (speed <= 500) speedText = 'Rápido';
            else if (speed <= 800) speedText = 'Normal';
            else if (speed <= 1200) speedText = 'Lento';
            else speedText = 'Muy Lento';
            
            speedLabel.textContent = `Velocidad: ${speedText}`;
        }
    }
    
    /**
     * Carga una nueva máquina para visualizar
     * @param {TuringMachine} machine - Máquina de Turing
     * @param {string} operation - Descripción de la operación
     */
    loadMachine(machine, operation = '') {
        console.log(`🎬 Cargando máquina para visualización: ${operation}`);
        console.log(`   Estados: ${machine.states.size}, Transiciones: ${machine.transitions.size}`);
        console.log(`   Pasos registrados: ${machine.history.length}`);
        
        this.currentMachine = machine;
        this.currentStep = 0;
        this.currentOperationElement.textContent = operation;
        
        this.stopAutoPlay();
        this.updateDisplay();
        this.updateControls();
        this.updateStepsLog(true); // Hacer scroll inicial al cargar nueva máquina
        this.updateAdditionalInfo();
        
        // Mostrar estadísticas iniciales
        this.showMachineStatistics();
    }
    
    /**
     * Muestra estadísticas de la máquina cargada
     */
    showMachineStatistics() {
        if (!this.currentMachine) return;
        
        const stats = this.currentMachine.getExecutionStats();
        const validation = this.currentMachine.validateMachine();
        
        console.log(`📊 Estadísticas de la máquina:`, stats);
        console.log(`✅ Validación:`, validation);
    }
    
    /**
     * Actualiza la visualización completa
     */
    updateDisplay() {
        if (!this.currentMachine) return;
        
        this.updateTape();
        this.updateMachineStatus();
        this.updateAdditionalInfo();
        this.highlightCurrentTransition();
    }
    
    /**
     * Actualiza información adicional de la máquina
     */
    updateAdditionalInfo() {
        if (!this.currentMachine) return;
        
        const currentState = this.getCurrentMachineState();
        
        // Actualizar símbolo actual
        const currentSymbolElement = document.getElementById('current-symbol');
        if (currentSymbolElement) {
            const symbol = currentState.currentSymbol || 'B';
            currentSymbolElement.textContent = symbol;
            currentSymbolElement.style.color = this.getSymbolColor(symbol);
        }
        
        // Actualizar información de transición
        const transitionElement = document.getElementById('current-transition');
        if (transitionElement && this.currentStep > 0) {
            const prevState = this.currentStep > 0 ? this.currentMachine.history[this.currentStep - 1] : null;
            const transition = this.getTransitionDescription(prevState, currentState);
            transitionElement.textContent = transition;
        }
        
        // Actualizar contador de pasos
        const stepDisplayElement = document.getElementById('current-step-display');
        if (stepDisplayElement) {
            stepDisplayElement.textContent = `${this.currentStep + 1}/${this.currentMachine.history.length}`;
        }
    }
    
    /**
     * Obtiene el color apropiado para un símbolo
     * @param {string} symbol - Símbolo
     * @returns {string} Color CSS
     */
    getSymbolColor(symbol) {
        const colorMap = {
            '0': '#2d3748',
            '1': '#2d3748', 
            '#': '#805ad5',
            'X': '#f56565',
            'Y': '#38a169',
            'B': '#a0aec0',
            '+': '#4299e1',
            '-': '#f56565',
            '*': '#38a169',
            '/': '#ed8936',
            'C': '#ffd700'
        };
        return colorMap[symbol] || '#2d3748';
    }
    
    /**
     * Obtiene descripción de la transición actual
     * @param {Object} prevState - Estado anterior
     * @param {Object} currentState - Estado actual
     * @returns {string} Descripción de la transición
     */
    getTransitionDescription(prevState, currentState) {
        if (!prevState) return 'Inicio';
        
        const symbol = prevState.currentSymbol || 'B';
        return `δ(${prevState.state}, ${symbol}) → ${currentState.state}`;
    }
    
    /**
     * Resalta la transición actual en la visualización
     */
    highlightCurrentTransition() {
        if (!this.highlightTransitions || !this.currentMachine) return;
        
        // Remover highlights previos
        const prevHighlighted = document.querySelectorAll('.transition-highlight');
        prevHighlighted.forEach(el => el.classList.remove('transition-highlight'));
        
        // Resaltar transición actual si existe
        if (this.currentStep > 0) {
            const currentStepEntry = document.querySelector(`.step-entry:nth-child(${this.currentStep + 1})`);
            if (currentStepEntry) {
                currentStepEntry.classList.add('transition-highlight');
            }
        }
    }
    
    /**
     * Actualiza la visualización de la cinta con mejoras
     */
    updateTape() {
        if (!this.currentMachine) return;
        
        const currentState = this.getCurrentMachineState();
        const tape = currentState.tape;
        const headPosition = currentState.head;
        
        // Limpiar cinta
        this.tapeElement.innerHTML = '';
        
        // Determinar rango óptimo para mostrar
        const minIndex = Math.min(0, headPosition - 8);
        const maxIndex = Math.max(tape.length - 1, headPosition + 8);
        
        // Crear celdas con información mejorada
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
            
            // Aplicar estilos según el tipo de símbolo
            cell.textContent = content;
            cell.style.color = this.getSymbolColor(content);
            
            // Marcar celda actual
            if (i === headPosition) {
                cell.classList.add('current');
                cell.setAttribute('title', `Posición ${i}: ${content} (Cabezal aquí)`);
            } else {
                cell.setAttribute('title', `Posición ${i}: ${content}`);
            }
            
            // Marcar tipos especiales de celdas
            if (content === 'B') {
                cell.classList.add('empty');
            } else if (['X', 'Y', 'C'].includes(content)) {
                cell.classList.add('marker');
            } else if (['#'].includes(content)) {
                cell.classList.add('separator');
            }
            
            // Añadir índice de posición
            if (this.showSymbolDetails) {
                const positionLabel = document.createElement('div');
                positionLabel.style.cssText = `
                    font-size: 0.6rem;
                    color: #a0aec0;
                    position: absolute;
                    top: -12px;
                    left: 50%;
                    transform: translateX(-50%);
                `;
                positionLabel.textContent = i;
                cell.style.position = 'relative';
                cell.appendChild(positionLabel);
            }
            
            this.tapeElement.appendChild(cell);
        }
        
        // Actualizar posición del cabezal
        this.updateTapeHead(headPosition, minIndex);
    }
    
    /**
     * Actualiza la posición del cabezal con animación
     * @param {number} headPosition - Posición del cabezal
     * @param {number} minIndex - Índice mínimo mostrado
     */
    updateTapeHead(headPosition, minIndex) {
        const cellWidth = 52; // 50px + 2px border
        const offset = (headPosition - minIndex) * cellWidth + cellWidth / 2 - 12;
        
        // Animación suave del cabezal
        this.tapeHeadElement.style.transition = 'left 0.3s ease';
        this.tapeHeadElement.style.left = `${offset}px`;
        
        // Actualizar símbolo del cabezal para mayor claridad
        this.tapeHeadElement.textContent = '▼';
        this.tapeHeadElement.style.fontSize = '1.5rem';
        this.tapeHeadElement.style.color = '#ffd700';
        this.tapeHeadElement.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
    }
    
    /**
     * Actualiza el estado de la máquina en la interfaz
     */
    updateMachineStatus() {
        if (!this.currentMachine) return;
        
        const currentState = this.getCurrentMachineState();
        
        this.currentStateElement.textContent = currentState.state;
        this.headPositionElement.textContent = currentState.head.toString();
        
        // Colorear estado según tipo
        if (this.currentMachine.acceptStates.has(currentState.state)) {
            this.currentStateElement.style.color = '#38a169'; // Verde para aceptación
        } else if (this.currentMachine.rejectStates.has(currentState.state)) {
            this.currentStateElement.style.color = '#f56565'; // Rojo para rechazo
        } else {
            this.currentStateElement.style.color = '#4299e1'; // Azul para estados normales
        }
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
                state: 'q0',
                currentSymbol: 'B'
            };
        }
        
        const stepIndex = Math.min(this.currentStep, this.currentMachine.history.length - 1);
        return this.currentMachine.history[stepIndex];
    }
    
    /**
     * Actualiza el log de pasos con información detallada
     * @param {boolean} forceScroll - Si debe hacer scroll independientemente de la configuración
     */
    updateStepsLog(forceScroll = false) {
        if (!this.currentMachine) {
            this.stepsLogElement.innerHTML = '<p class="no-steps">No hay pasos registrados aún</p>';
            return;
        }
        
        const history = this.currentMachine.history;
        if (history.length === 0) {
            this.stepsLogElement.innerHTML = '<p class="no-steps">No hay pasos registrados aún</p>';
            return;
        }
        
        // Crear resumen inicial
        const summary = this.createExecutionSummary();
        
        this.stepsLogElement.innerHTML = summary;
        
        // Crear entradas de pasos
        const stepsContainer = document.createElement('div');
        stepsContainer.className = 'steps-container';
        
        history.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'step-entry';
            
            if (index === this.currentStep) {
                stepElement.classList.add('current');
            }
            
            // Información básica del paso
            let stepInfo = `<strong>Paso ${step.step}:</strong> ${step.description}`;
            
            // Información técnica detallada
            if (index > 0) {
                const prevStep = history[index - 1];
                const transition = this.getTransitionDescription(prevStep, step);
                stepInfo += `<br><small style="color: #805ad5;">Transición: ${transition}</small>`;
            }
            
            stepInfo += `<br><small>Estado: <span style="color: ${this.getSymbolColor(step.state)}">${step.state}</span> | `;
            stepInfo += `Posición: ${step.head} | `;
            stepInfo += `Símbolo: <span style="color: ${this.getSymbolColor(step.currentSymbol || 'B')}">${step.currentSymbol || 'B'}</span></small>`;
            
            // Mostrar cinta compacta
            if (this.showSymbolDetails) {
                const compactTape = this.getCompactTapeView(step.tape, step.head);
                stepInfo += `<br><small style="font-family: monospace; background: #f7fafc; padding: 2px 4px; border-radius: 3px;">Cinta: ${compactTape}</small>`;
            }
            
            stepElement.innerHTML = stepInfo;
            
            stepElement.addEventListener('click', () => {
                this.goToStep(index, true); // Al hacer clic, sí hacer scroll
            });
            
            stepsContainer.appendChild(stepElement);
        });
        
        this.stepsLogElement.appendChild(stepsContainer);
        
        // Scroll al paso actual solo si se fuerza o según configuración
        if (forceScroll) {
            this.scrollToCurrentStepForced();
        } else {
            this.scrollToCurrentStep();
        }
    }
    
    /**
     * Crea un resumen de la ejecución
     * @returns {string} HTML del resumen
     */
    createExecutionSummary() {
        const stats = this.currentMachine.getExecutionStats();
        const validation = this.currentMachine.validateMachine();
        
        return `
            <div class="execution-summary" style="background: #edf2f7; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin: 0 0 8px 0;">📊 Resumen de Ejecución</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; font-size: 0.9rem;">
                    <div><strong>Pasos totales:</strong> ${stats.totalSteps}</div>
                    <div><strong>Estados visitados:</strong> ${stats.statesVisited}</div>
                    <div><strong>Estado final:</strong> <span style="color: ${this.getSymbolColor(stats.finalState)}">${stats.finalState}</span></div>
                    <div><strong>Posición final:</strong> ${stats.finalHeadPosition}</div>
                    <div><strong>Longitud cinta:</strong> ${stats.finalTapeLength}</div>
                    <div><strong>Máquina válida:</strong> ${validation.valid ? '✅' : '❌'}</div>
                </div>
            </div>
        `;
    }
    
    /**
     * Obtiene una vista compacta de la cinta
     * @param {Array} tape - Array de la cinta
     * @param {number} head - Posición del cabezal
     * @returns {string} Vista compacta
     */
    getCompactTapeView(tape, head) {
        const start = Math.max(0, head - 3);
        const end = Math.min(tape.length, head + 4);
        
        let view = '';
        if (start > 0) view += '...';
        
        for (let i = start; i < end; i++) {
            const symbol = tape[i] || 'B';
            if (i === head) {
                view += `[${symbol}]`;
            } else {
                view += symbol;
            }
        }
        
        if (end < tape.length) view += '...';
        
        return view || 'B';
    }
    
    /**
     * Hace scroll al paso actual (controlado por configuración)
     */
    scrollToCurrentStep() {
        // Solo hacer scroll si está habilitado globalmente O si está en auto-play y configurado para eso
        const shouldScroll = this.autoScrollEnabled || 
            (this.isAutoPlaying && this.autoScrollOnlyDuringAutoPlay);
            
        if (!shouldScroll) return;
        
        const currentStepElement = this.stepsLogElement.querySelector('.step-entry.current');
        if (currentStepElement) {
            currentStepElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
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
        
        // Actualizar textos de botones
        if (hasHistory) {
            document.getElementById('prev-step').textContent = `← Anterior (${this.currentStep})`;
            document.getElementById('next-step').textContent = `Siguiente → (${this.currentMachine.history.length - this.currentStep - 1} restantes)`;
        }
    }
    
    /**
     * Va al paso anterior
     */
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateDisplay();
            this.updateControls();
            this.updateStepsLog(false); // No hacer scroll automático en navegación manual
            
            // Efecto visual de retroceso
            this.addStepTransitionEffect('backward');
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
            this.updateStepsLog(false); // No hacer scroll automático en navegación manual
            
            // Efecto visual de avance
            this.addStepTransitionEffect('forward');
        }
    }
    
    /**
     * Añade efecto visual a las transiciones
     * @param {string} direction - 'forward' o 'backward'
     */
    addStepTransitionEffect(direction) {
        const tapeElement = this.tapeElement;
        if (tapeElement) {
            tapeElement.style.transform = direction === 'forward' ? 'scale(1.02)' : 'scale(0.98)';
            setTimeout(() => {
                tapeElement.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    /**
     * Hace scroll al paso actual (forzado, ignorando configuración)
     */
    scrollToCurrentStepForced() {
        const currentStepElement = this.stepsLogElement.querySelector('.step-entry.current');
        if (currentStepElement) {
            currentStepElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
        }
    }
    
    /**
     * Va a un paso específico
     * @param {number} stepIndex - Índice del paso
     * @param {boolean} forceScroll - Si debe hacer scroll forzado
     */
    goToStep(stepIndex, forceScroll = false) {
        if (this.currentMachine && stepIndex >= 0 && stepIndex < this.currentMachine.history.length) {
            this.currentStep = stepIndex;
            this.updateDisplay();
            this.updateControls();
            this.updateStepsLog(forceScroll);
            
            console.log(`🎯 Navegando al paso ${stepIndex + 1}/${this.currentMachine.history.length}`);
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
        document.getElementById('auto-play').style.background = '#f56565';
        
        console.log(`▶️ Iniciando reproducción automática (velocidad: ${this.animationSpeed}ms)`);
        
        this.autoPlayInterval = setInterval(() => {
            if (this.currentStep < this.currentMachine.history.length - 1) {
                this.currentStep++;
                this.updateDisplay();
                this.updateControls();
                this.updateStepsLog(true); // Durante auto-play SÍ hacer scroll
                
                // Efecto visual de avance
                this.addStepTransitionEffect('forward');
            } else {
                this.stopAutoPlay();
                console.log(`⏹️ Reproducción automática completada`);
            }
        }, this.animationSpeed);
    }
    
    /**
     * Detiene la reproducción automática
     */
    stopAutoPlay() {
        this.isAutoPlaying = false;
        document.getElementById('auto-play').textContent = '▶ Auto';
        document.getElementById('auto-play').style.background = '#4a5568';
        
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
            
            // Efecto visual para resultado nuevo
            this.resultBinaryElement.style.animation = 'pulse 0.5s ease';
            this.resultDecimalElement.style.animation = 'pulse 0.5s ease';
            
            setTimeout(() => {
                this.resultBinaryElement.style.animation = '';
                this.resultDecimalElement.style.animation = '';
            }, 500);
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
        
        this.tapeElement.innerHTML = '<div class="tape-cell empty">B</div>';
        this.currentOperationElement.textContent = '-';
        this.currentStateElement.textContent = 'q0';
        this.headPositionElement.textContent = '0';
        this.stepsLogElement.innerHTML = '<p class="no-steps">No hay pasos registrados aún</p>';
        this.resultBinaryElement.textContent = '-';
        this.resultDecimalElement.textContent = '-';
        
        // Limpiar información adicional
        const currentSymbolElement = document.getElementById('current-symbol');
        const transitionElement = document.getElementById('current-transition');
        const stepDisplayElement = document.getElementById('current-step-display');
        
        if (currentSymbolElement) currentSymbolElement.textContent = '-';
        if (transitionElement) transitionElement.textContent = '-';
        if (stepDisplayElement) stepDisplayElement.textContent = '0/0';
        
        this.updateControls();
        
        console.log('🧹 Visualización limpiada');
    }
    
    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje de error
     */
    showError(message) {
        this.stepsLogElement.innerHTML = `
            <div class="error-message" style="color: #f56565; padding: 15px; background: #fed7d7; border-radius: 8px; border-left: 4px solid #f56565;">
                <h4 style="margin: 0 0 8px 0;">❌ Error</h4>
                <p style="margin: 0;">${message}</p>
            </div>
        `;
        
        console.error('❌ Error en visualización:', message);
    }
    
    /**
     * Exporta el estado actual para depuración
     * @returns {Object} Estado exportable
     */
    exportCurrentState() {
        if (!this.currentMachine) return null;
        
        return {
            currentStep: this.currentStep,
            totalSteps: this.currentMachine.history.length,
            machineConfig: this.currentMachine.exportConfiguration(),
            executionStats: this.currentMachine.getExecutionStats(),
            currentState: this.getCurrentMachineState()
        };
    }
}

// Exportar para uso global
window.TuringVisualization = TuringVisualization;