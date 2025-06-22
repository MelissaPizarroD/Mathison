/**
 * Archivo principal actualizado para la Calculadora Binaria con Máquinas de Turing REALES
 */

class BinaryCalculatorApp {
    constructor() {
        this.visualization = null;
        this.currentEvaluation = null;
        this.currentMachineIndex = 0;
        this.realTuringMode = true; // Nuevo: modo máquinas de Turing reales
        
        this.initializeApp();
    }
    
    /**
     * Inicializa la aplicación
     */
    initializeApp() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApp());
        } else {
            this.setupApp();
        }
    }
    
    /**
     * Configura la aplicación después de que el DOM esté listo
     */
    setupApp() {
        this.visualization = new TuringVisualization();
        this.setupEventListeners();
        this.showInitialExample();
        this.addRealTuringModeInfo();
        
        console.log('🤖 Calculadora Binaria con Máquinas de Turing REALES iniciada');
        console.log('✨ Modo: Ejecución real paso a paso en la cinta');
    }
    
    /**
     * Añade información sobre el modo de máquinas reales
     */
    addRealTuringModeInfo() {
        const helpText = document.querySelector('.help-text');
        if (helpText) {
            const realModeInfo = document.createElement('div');
            realModeInfo.className = 'real-mode-info';
            realModeInfo.style.cssText = `
                background: #e6fffa; 
                border: 2px solid #38a169; 
                border-radius: 8px; 
                padding: 15px; 
                margin-top: 15px;
            `;
            realModeInfo.innerHTML = `
                <h4 style="margin: 0 0 10px 0; color: #38a169;">🤖 MODO MÁQUINAS DE TURING REALES</h4>
                <p><strong>Ahora las operaciones se ejecutan realmente paso a paso en la cinta!</strong></p>
                <p>• Las operaciones simples (1+0, 1+1, etc.) usan máquinas completamente reales</p>
                <p>• Las operaciones complejas muestran el proceso real de suma/resta/multiplicación/división</p>
                <p>• Cada paso que ves es un paso real de la máquina de Turing</p>
                <p>• Puedes navegar paso a paso para ver exactamente cómo se procesa cada operación</p>
            `;
            
            helpText.appendChild(realModeInfo);
        }
    }
    
    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.calculateExpression();
        });
        
        document.getElementById('step-btn').addEventListener('click', () => {
            this.showStepByStep();
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetCalculator();
        });
        
        document.getElementById('expression').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.calculateExpression();
            }
        });
        
        document.getElementById('expression').addEventListener('dblclick', () => {
            this.loadRandomExample();
        });
        
        // Nuevo: botón para alternar modo debug
        this.addDebugModeToggle();
    }
    
    /**
     * Añade control para modo debug
     */
    addDebugModeToggle() {
        const controls = document.querySelector('.controls');
        if (controls) {
            const debugToggle = document.createElement('button');
            debugToggle.textContent = '🔍 Debug OFF';
            debugToggle.className = 'control-btn debug-toggle';
            debugToggle.style.background = '#805ad5';
            
            debugToggle.addEventListener('click', () => {
                this.realTuringMode = !this.realTuringMode;
                debugToggle.textContent = this.realTuringMode ? '🔍 Debug OFF' : '🔍 Debug ON';
                debugToggle.style.background = this.realTuringMode ? '#805ad5' : '#f56565';
                
                this.showNotification(
                    `Modo debug ${this.realTuringMode ? 'desactivado' : 'activado'}`,
                    'info'
                );
            });
            
            controls.appendChild(debugToggle);
        }
    }
    
    /**
     * Muestra un ejemplo inicial
     */
    showInitialExample() {
        const examples = [
            '1 + 1',      // Para mostrar máquina real simple
            '10 + 11',    // Para mostrar máquina híbrida
            '101 + 110',  // Para mostrar algoritmo complejo
            '1000 - 11',  // Resta
            '11 * 10',    // Multiplicación
            '1100 / 11'   // División
        ];
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        document.getElementById('expression').placeholder = `Ej: ${randomExample} (¡Prueba máquinas reales!)`;
    }
    
    /**
     * Calcula la expresión ingresada - CORREGIDA
     */
calculateExpression() {
    const expression = document.getElementById('expression').value.trim();
    
    if (!expression) {
        this.showError('Por favor ingresa una expresión binaria');
        return;
    }
    
    this.setProcessingState(true);
    
    try {
        console.log(`🧮 Procesando expresión: ${expression}`);
        
        const evaluation = ExpressionParser.validateExpression(expression);
        
        if (!evaluation.success) {
            let errorMessage = evaluation.error;
            if (evaluation.correction && evaluation.correction.hasCorrections) {
                errorMessage += `\n\n💡 ${evaluation.correction.suggestion}`;
                this.showCorrectionSuggestion(evaluation.correction);
            }
            this.showError(errorMessage);
            return;
        }
        
        if (evaluation.usedCorrection) {
            this.showNotification(
                `Expresión corregida automáticamente: "${evaluation.correction.corrected}"`, 
                'info'
            );
            document.getElementById('expression').value = evaluation.correction.corrected;
        }
        
        this.currentEvaluation = evaluation;
        
        // CORRECCIÓN 10: Cargar la ÚLTIMA máquina (resultado final) por defecto
        if (evaluation.machines && evaluation.machines.length > 0) {
            this.currentMachineIndex = evaluation.machines.length - 1; // Última máquina
            this.loadMachine(this.currentMachineIndex);
            document.getElementById('step-btn').disabled = false;
        }
        
        // Mostrar resultado
        this.visualization.updateResult(evaluation.result);
        
        // CORRECCIÓN 11: Actualizar contadores en la interfaz
        this.updateResultCounters(evaluation);
        
        // Mostrar información sobre las máquinas ejecutadas
        this.showMachineExecutionSummary(evaluation);
        
        // Mostrar resumen detallado
        this.showEvaluationSummary(evaluation);
        
    } catch (error) {
        console.error('❌ Error en calculateExpression:', error);
        this.showError(`Error inesperado: ${error.message}`);
    } finally {
        this.setProcessingState(false);
    }
}

//NUEVA FUNCION

updateResultCounters(evaluation) {
    const machinesCountElement = document.getElementById('machines-count');
    const totalStepsElement = document.getElementById('total-steps');
    
    if (machinesCountElement && evaluation && evaluation.machines) {
        machinesCountElement.textContent = evaluation.machines.length.toString();
        
        const totalSteps = evaluation.machines.reduce((sum, m) => sum + m.machine.history.length, 0);
        if (totalStepsElement) {
            totalStepsElement.textContent = totalSteps.toString();
        }
        
        // Añadir efectos visuales
        machinesCountElement.style.animation = 'pulse 0.5s ease';
        totalStepsElement.style.animation = 'pulse 0.5s ease';
        
        setTimeout(() => {
            machinesCountElement.style.animation = '';
            totalStepsElement.style.animation = '';
        }, 500);
    }
}

// AQUI TERMINA FUNCION NUEVA
    
    /**
     * Muestra resumen de la ejecución de máquinas
     * @param {Object} evaluation - Resultado de la evaluación
     */
    showMachineExecutionSummary(evaluation) {
        if (!evaluation.machines || evaluation.machines.length === 0) return;
        
        console.log(`\n📊 RESUMEN DE EJECUCIÓN DE MÁQUINAS DE TURING:`);
        console.log(`   Total de operaciones: ${evaluation.machines.length}`);
        
        evaluation.machines.forEach((machineInfo, index) => {
            const machine = machineInfo.machine;
            const stats = machine.getExecutionStats();
            
            console.log(`\n   🤖 Operación ${index + 1}: ${machineInfo.operation}`);
            console.log(`      Pasos ejecutados: ${stats.totalSteps}`);
            console.log(`      Estados visitados: ${stats.statesVisited}`);
            console.log(`      Estado final: ${stats.finalState}`);
            console.log(`      Cinta final: ${machine.getTapeContent()}`);
            console.log(`      Resultado: ${machineInfo.result.binary} (${machineInfo.result.decimal})`);
            
            if (machineInfo.error) {
                console.warn(`      ⚠️ Error: ${machineInfo.error}`);
            }
        });
        
        // Mostrar notificación con estadísticas
        const totalSteps = evaluation.machines.reduce((sum, m) => sum + m.machine.history.length, 0);
        this.showNotification(
            `Ejecutadas ${evaluation.machines.length} máquinas de Turing con ${totalSteps} pasos totales`,
            'success'
        );
    }
    
    /**
     * Muestra la evaluación paso a paso
     */
    showStepByStep() {
        if (!this.currentEvaluation || !this.currentEvaluation.machines) {
            this.showError('No hay operaciones para mostrar');
            return;
        }
        
        this.showMachineNavigator();
        
        // Mostrar información adicional sobre las máquinas
        this.showMachineDetails();
    }
    
    /**
     * Muestra detalles técnicos de las máquinas
     */
    showMachineDetails() {
        if (!this.currentEvaluation.machines.length) return;
        
        const currentMachine = this.currentEvaluation.machines[this.currentMachineIndex];
        const machine = currentMachine.machine;
        const validation = machine.validateMachine();
        
        const detailsHTML = `
            <div class="machine-details" style="margin: 15px 0; padding: 15px; background: #f7fafc; border-radius: 8px; border-left: 4px solid #4299e1;">
                <h4>🔧 Detalles Técnicos de la Máquina Actual</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
                    <div><strong>Operación:</strong> ${currentMachine.operation}</div>
                    <div><strong>Estados definidos:</strong> ${validation.stats.states}</div>
                    <div><strong>Transiciones:</strong> ${validation.stats.transitions}</div>
                    <div><strong>Estados de aceptación:</strong> ${validation.stats.acceptStates}</div>
                    <div><strong>Pasos ejecutados:</strong> ${machine.history.length}</div>
                    <div><strong>Estado final:</strong> ${machine.state}</div>
                </div>
                <div style="margin-top: 10px;">
                    <strong>Configuración válida:</strong> ${validation.valid ? '✅ Sí' : '❌ No'}
                    ${validation.issues.length > 0 ? `<br><small>Problemas: ${validation.issues.join(', ')}</small>` : ''}
                </div>
                <details style="margin-top: 10px;">
                    <summary style="cursor: pointer; font-weight: bold;">Ver estadísticas de ejecución</summary>
                    <pre style="background: #edf2f7; padding: 10px; border-radius: 4px; overflow-x: auto; margin-top: 5px; font-size: 0.8rem;">${JSON.stringify(machine.getExecutionStats(), null, 2)}</pre>
                </details>
            </div>
        `;
        
        const stepsSection = document.querySelector('.steps-section');
        let details = stepsSection.querySelector('.machine-details');
        
        if (details) {
            details.remove();
        }
        
        stepsSection.insertAdjacentHTML('afterbegin', detailsHTML);
    }
    
    /**
     * Muestra el navegador de máquinas mejorado
     */
    showMachineNavigator() {
        if (!this.currentEvaluation.machines.length) return;
        
        const machines = this.currentEvaluation.machines;
        
        let navigatorHTML = `
            <div class="machine-navigator" style="margin: 15px 0; padding: 15px; background: #f7fafc; border-radius: 8px;">
                <h4>🤖 Máquinas de Turing Ejecutadas (${machines.length})</h4>
                <div class="machine-list" style="margin: 10px 0;">
        `;
        
        machines.forEach((machineInfo, index) => {
            const isActive = index === this.currentMachineIndex;
            const machine = machineInfo.machine;
            const stepCount = machine.history.length;
            const success = machine.acceptStates.has(machine.state);
            
            navigatorHTML += `
                <button class="machine-btn ${isActive ? 'active' : ''}" 
                        onclick="app.loadMachine(${index})"
                        style="
                            margin: 5px; 
                            padding: 10px 15px; 
                            border: 2px solid ${success ? '#38a169' : '#f56565'}; 
                            border-radius: 6px;
                            background: ${isActive ? '#4299e1' : 'white'};
                            color: ${isActive ? 'white' : 'black'};
                            cursor: pointer;
                            display: block;
                            width: 100%;
                            text-align: left;
                        ">
                    <div style="font-weight: bold;">${index + 1}. ${machineInfo.operation}</div>
                    <div style="font-size: 0.8rem; opacity: 0.8;">
                        ${stepCount} pasos • ${success ? '✅ Éxito' : '❌ Error'} • ${machineInfo.result.binary}
                    </div>
                </button>
            `;
        });
        
        navigatorHTML += `
                </div>
                <p style="margin-top: 10px;"><small>💡 Haz clic en una operación para ver su ejecución paso a paso en la máquina de Turing</small></p>
            </div>
        `;
        
        const stepsSection = document.querySelector('.steps-section');
        let navigator = stepsSection.querySelector('.machine-navigator');
        
        if (navigator) {
            navigator.remove();
        }
        
        stepsSection.insertAdjacentHTML('afterbegin', navigatorHTML);
    }
    
    /**
     * Carga una máquina específica con información detallada
     * @param {number} index - Índice de la máquina
     */
    loadMachine(index) {
        if (!this.currentEvaluation || !this.currentEvaluation.machines[index]) {
            return;
        }
        
        this.currentMachineIndex = index;
        const machineInfo = this.currentEvaluation.machines[index];
        const machine = machineInfo.machine;
        
        console.log(`🔍 Cargando máquina ${index + 1}: ${machineInfo.operation}`);
        console.log(`   Estados: ${machine.states.size}, Transiciones: ${machine.transitions.size}`);
        console.log(`   Pasos ejecutados: ${machine.history.length}`);
        
        // Habilitar modo debug si está activado
        if (!this.realTuringMode) {
            machine.setDebugMode(true);
        }
        
        // Cargar en la visualización
        this.visualization.loadMachine(machine, `${machineInfo.operation} (${machine.history.length} pasos)`);
        
        // Actualizar navegador
        this.updateMachineNavigatorButtons();
        
        // Mostrar detalles
        this.showMachineDetails();
        
        // Mostrar información en consola
        if (!this.realTuringMode) {
            console.log(`📊 Estadísticas de ejecución:`, machine.getExecutionStats());
            console.log(`🔧 Validación:`, machine.validateMachine());
        }
    }
    
    /**
     * Actualiza los botones del navegador de máquinas
     */
    updateMachineNavigatorButtons() {
        const buttons = document.querySelectorAll('.machine-btn');
        buttons.forEach((btn, i) => {
            if (i === this.currentMachineIndex) {
                btn.classList.add('active');
                btn.style.background = '#4299e1';
                btn.style.color = 'white';
            } else {
                btn.classList.remove('active');
                btn.style.background = 'white';
                btn.style.color = 'black';
            }
        });
    }
    
    /**
     * Muestra un resumen mejorado de la evaluación
     * @param {Object} evaluation - Resultado de la evaluación
     */
    showEvaluationSummary(evaluation) {
        const totalSteps = evaluation.machines.reduce((sum, m) => sum + m.machine.history.length, 0);
        const successfulMachines = evaluation.machines.filter(m => m.success !== false).length;
        
        const summary = `
            <div class="evaluation-summary" style="background: #e6fffa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #38a169;">
                <h4>📊 Resumen de Ejecución Completa</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 10px 0;">
                    <div><strong>Expresión:</strong> ${evaluation.expression}</div>
                    <div><strong>Resultado:</strong> ${evaluation.result.binary} (${evaluation.result.decimal})</div>
                    <div><strong>Máquinas ejecutadas:</strong> ${evaluation.machines.length}</div>
                    <div><strong>Pasos totales:</strong> ${totalSteps}</div>
                    <div><strong>Máquinas exitosas:</strong> ${successfulMachines}/${evaluation.machines.length}</div>
                    <div><strong>Tiempo de ejecución:</strong> ${Date.now() - (evaluation.startTime || Date.now())}ms</div>
                </div>
                <details style="margin-top: 10px;">
                    <summary style="cursor: pointer; font-weight: bold;">Ver pasos de evaluación detallados</summary>
                    <ol style="margin: 10px 0 0 20px;">
                        ${evaluation.steps.map(step => `<li style="margin: 2px 0;">${step.description}</li>`).join('')}
                    </ol>
                </details>
                <details style="margin-top: 5px;">
                    <summary style="cursor: pointer; font-weight: bold;">Ver tokens de la expresión</summary>
                    <div style="font-family: monospace; background: #edf2f7; padding: 10px; border-radius: 4px; margin-top: 5px;">
                        Tokens: ${evaluation.tokens ? evaluation.tokens.map(t => `${t.type}:${t.value}`).join(' | ') : 'No disponible'}
                    </div>
                </details>
            </div>
        `;
        
        const stepsLog = document.getElementById('steps-log');
        stepsLog.innerHTML = summary + stepsLog.innerHTML;
    }
    
    /**
     * Aplica una corrección sugerida
     * @param {string} correctedExpression - Expresión corregida
     */
    applySuggestedCorrection(correctedExpression) {
        document.getElementById('expression').value = correctedExpression;
        
        const suggestion = document.querySelector('.correction-suggestion');
        if (suggestion) {
            suggestion.remove();
        }
        
        this.calculateExpression();
        this.showNotification('Corrección aplicada y calculada', 'success');
    }
    
    /**
     * Muestra una sugerencia de corrección
     * @param {Object} correction - Objeto de corrección
     */
    showCorrectionSuggestion(correction) {
        const suggestionHTML = `
            <div class="correction-suggestion" style="
                background: #fef5e7; 
                border: 1px solid #f6ad55; 
                border-radius: 8px; 
                padding: 15px; 
                margin: 15px 0;
                position: relative;
            ">
                <h4 style="margin: 0 0 10px 0; color: #c05621;">💡 Sugerencia de Corrección</h4>
                <p><strong>Original:</strong> "${correction.original}"</p>
                <p><strong>Sugerencia:</strong> "${correction.corrected}"</p>
                <p><strong>Cambios:</strong> ${correction.corrections.join(', ')}</p>
                <div style="margin-top: 10px;">
                    <button onclick="app.applySuggestedCorrection('${correction.corrected}')" 
                            style="background: #38a169; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 8px; cursor: pointer;">
                        ✅ Aplicar Corrección
                    </button>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="background: #e53e3e; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        ❌ Ignorar
                    </button>
                </div>
            </div>
        `;
        
        const stepsLog = document.getElementById('steps-log');
        stepsLog.insertAdjacentHTML('afterbegin', suggestionHTML);
    }
    
    /**
     * Reinicia la calculadora
     */
    resetCalculator() {
        document.getElementById('expression').value = '';
        this.visualization.clear();
        this.currentEvaluation = null;
        this.currentMachineIndex = 0;
        document.getElementById('step-btn').disabled = true;
        
        // Limpiar elementos adicionales
        const elementsToRemove = [
            '.machine-navigator',
            '.machine-details', 
            '.correction-suggestion',
            '.evaluation-summary'
        ];
        
        elementsToRemove.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });
        
        console.log('🔄 Calculadora reiniciada - Lista para nuevas máquinas de Turing');
    }
    
    /**
     * Carga un ejemplo aleatorio
     */
    loadRandomExample() {
        const simpleExamples = ['1 + 0', '1 + 1', '10 + 01', '11 + 10'];
        const complexExamples = ExpressionParser.getExamples();
        
        // 50% probabilidad de ejemplo simple (máquina real) vs complejo
        const useSimple = Math.random() < 0.5;
        const examples = useSimple ? simpleExamples : complexExamples;
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        
        document.getElementById('expression').value = randomExample;
        
        this.showNotification(
            `Ejemplo cargado: ${randomExample} ${useSimple ? '(máquina real simple)' : '(algoritmo complejo)'}`,
            'info'
        );
        
        setTimeout(() => {
            this.calculateExpression();
        }, 100);
    }
    
    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje de error
     */
    showError(message) {
        this.visualization.showError(message);
        console.error('❌ Error:', message);
        this.showNotification(message, 'error');
    }
    
    /**
     * Muestra una notificación temporal
     * @param {string} message - Mensaje
     * @param {string} type - Tipo ('success', 'error', 'info')
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        switch (type) {
            case 'success':
                notification.style.background = '#38a169';
                break;
            case 'error':
                notification.style.background = '#e53e3e';
                break;
            default:
                notification.style.background = '#4299e1';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * Establece el estado de procesamiento
     * @param {boolean} isProcessing - Si está procesando
     */
    setProcessingState(isProcessing) {
        const calculateBtn = document.getElementById('calculate-btn');
        const expressionInput = document.getElementById('expression');
        
        if (isProcessing) {
            calculateBtn.disabled = true;
            calculateBtn.textContent = 'Ejecutando Máquinas...';
            calculateBtn.classList.add('processing');
            expressionInput.disabled = true;
        } else {
            calculateBtn.disabled = false;
            calculateBtn.textContent = 'Calcular';
            calculateBtn.classList.remove('processing');
            expressionInput.disabled = false;
        }
    }
}

// Inicializar aplicación
let app;

function initializeApp() {
    app = new BinaryCalculatorApp();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

window.BinaryCalculatorApp = BinaryCalculatorApp;

// Función de ayuda mejorada
function showHelp() {
    const helpText = `
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h3>🤖 CALCULADORA BINARIA CON MÁQUINAS DE TURING REALES</h3>
            
            <div style="background: #e6fffa; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #38a169;">
                <h4 style="color: #38a169;">✨ NUEVO: Ejecución Real de Máquinas de Turing</h4>
                <p>Esta calculadora ahora ejecuta <strong>verdaderas máquinas de Turing</strong> que procesan operaciones binarias paso a paso en la cinta.</p>
                <ul>
                    <li><strong>Operaciones simples (1+1, 1+0):</strong> Máquinas completamente reales con transiciones auténticas</li>
                    <li><strong>Operaciones complejas:</strong> Algoritmos reales de suma/resta/multiplicación/división</li>
                    <li><strong>Visualización paso a paso:</strong> Cada movimiento del cabezal es real</li>
                    <li><strong>Estados y transiciones:</strong> Configuraciones auténticas de máquinas de Turing</li>
                </ul>
            </div>
            
            <h4>🎯 Ejemplos para Probar:</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                <div>
                    <h5>Máquinas Reales Simples:</h5>
                    <ul>
                        <li><strong>1 + 0</strong> → Máquina con 5 estados</li>
                        <li><strong>1 + 1</strong> → Máquina con acarreo</li>
                        <li><strong>10 + 01</strong> → Procesamiento multi-dígito</li>
                    </ul>
                </div>
                <div>
                    <h5>Algoritmos Complejos:</h5>
                    <ul>
                        <li><strong>101 + 110</strong> → Suma con representación unaria</li>
                        <li><strong>1000 - 11</strong> → Resta por restas repetidas</li>
                        <li><strong>11 * 10</strong> → Multiplicación por sumas</li>
                        <li><strong>1100 / 11</strong> → División por restas</li>
                    </ul>
                </div>
            </div>
            
            <h4>🔧 Características Técnicas:</h4>
            <ul>
                <li><strong>Estados reales:</strong> q0, q1, q2... qf con transiciones auténticas</li>
                <li><strong>Símbolos de cinta:</strong> 0, 1, #, X, Y, B (blanco)</li>
                <li><strong>Movimientos:</strong> L (izquierda), R (derecha), S (sin movimiento)</li>
                <li><strong>Validación:</strong> Verificación de máquinas bien formadas</li>
                <li><strong>Estadísticas:</strong> Pasos ejecutados, estados visitados, frecuencias</li>
                <li><strong>Debug mode:</strong> Información detallada de ejecución</li>
            </ul>
            
            <h4>📊 Cómo Interpretar la Visualización:</h4>
            <ul>
                <li><strong>Cinta dorada:</strong> Posición actual del cabezal</li>
                <li><strong>Estados q0-qf:</strong> Estado actual de la máquina</li>
                <li><strong>Pasos navegables:</strong> Cada transición δ(estado, símbolo)</li>
                <li><strong>Múltiples máquinas:</strong> Una por cada operación en expresiones complejas</li>
            </ul>
            
            <h4>🚀 Casos de Uso Educativos:</h4>
            <ul>
                <li><strong>Estudiantes:</strong> Ver cómo funcionan realmente las máquinas de Turing</li>
                <li><strong>Profesores:</strong> Demostrar conceptos de computación teórica</li>
                <li><strong>Investigadores:</strong> Analizar algoritmos de aritmética binaria</li>
                <li><strong>Curiosos:</strong> Explorar los fundamentos de la computación</li>
            </ul>
            
            <p style="background: #fff5d6; padding: 10px; border-radius: 4px; margin-top: 15px;">
                💡 <strong>Tip:</strong> Prueba primero con operaciones simples como "1 + 1" para ver máquinas completamente reales, luego experimenta con expresiones complejas como "(101 + 110) * 10"
            </p>
        </div>
    `;
    
    const stepsLog = document.getElementById('steps-log');
    stepsLog.innerHTML = helpText;
}

// Agregar botón de ayuda mejorado
document.addEventListener('DOMContentLoaded', () => {
    const helpButton = document.createElement('button');
    helpButton.textContent = '❓ Ayuda Máquinas Reales';
    helpButton.className = 'control-btn';
    helpButton.style.background = '#38a169';
    helpButton.onclick = showHelp;
    
    const controls = document.querySelector('.controls');
    if (controls) {
        controls.appendChild(helpButton);
    }
});