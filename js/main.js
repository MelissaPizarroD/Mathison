/**
 * Archivo principal de la Calculadora Binaria con Máquinas de Turing
 */

class BinaryCalculatorApp {
    constructor() {
        this.visualization = null;
        this.currentEvaluation = null;
        this.currentMachineIndex = 0;
        
        this.initializeApp();
    }
    
    /**
     * Inicializa la aplicación
     */
    initializeApp() {
        // Esperar a que el DOM esté listo
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
        // Inicializar visualización
        this.visualization = new TuringVisualization();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Mostrar ejemplo inicial
        this.showInitialExample();
        
        console.log('🤖 Calculadora Binaria con Máquinas de Turing iniciada');
    }
    
    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Botón calcular
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.calculateExpression();
        });
        
        // Botón paso a paso
        document.getElementById('step-btn').addEventListener('click', () => {
            this.showStepByStep();
        });
        
        // Botón reiniciar
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetCalculator();
        });
        
        // Enter en el input
        document.getElementById('expression').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.calculateExpression();
            }
        });
        
        // Doble click en input para ejemplo aleatorio
        document.getElementById('expression').addEventListener('dblclick', () => {
            this.loadRandomExample();
        });
    }
    
    /**
     * Muestra un ejemplo inicial
     */
    showInitialExample() {
        const examples = ExpressionParser.getExamples();
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        document.getElementById('expression').placeholder = `Ej: ${randomExample}`;
    }
    
    /**
     * Calcula la expresión ingresada
     */
    calculateExpression() {
        const expression = document.getElementById('expression').value.trim();
        
        if (!expression) {
            this.showError('Por favor ingresa una expresión binaria');
            return;
        }
        
        // Mostrar que está procesando
        this.setProcessingState(true);
        
        try {
            // Usar la nueva función de validación mejorada
            const evaluation = ExpressionParser.validateExpression(expression);
            
            if (!evaluation.success) {
                // Mostrar error con sugerencia si está disponible
                let errorMessage = evaluation.error;
                if (evaluation.correction && evaluation.correction.hasCorrections) {
                    errorMessage += `\n\n💡 ${evaluation.correction.suggestion}`;
                    errorMessage += `\nCorrecciones aplicadas: ${evaluation.correction.corrections.join(', ')}`;
                }
                this.showError(errorMessage);
                
                // Si hay una corrección disponible, mostrar botón para aplicarla
                if (evaluation.correction && evaluation.correction.hasCorrections) {
                    this.showCorrectionSuggestion(evaluation.correction);
                }
                return;
            }
            
            // Si se usó corrección automática, notificar al usuario
            if (evaluation.usedCorrection) {
                this.showNotification(
                    `Expresión corregida automáticamente: "${evaluation.correction.corrected}"`, 
                    'info'
                );
                document.getElementById('expression').value = evaluation.correction.corrected;
            }
            
            this.currentEvaluation = evaluation;
            this.currentMachineIndex = 0;
            
            // Mostrar resultado
            this.visualization.updateResult(evaluation.result);
            
            // Si hay máquinas, mostrar la primera
            if (evaluation.machines && evaluation.machines.length > 0) {
                this.loadMachine(0);
                document.getElementById('step-btn').disabled = false;
            }
            
            // Mostrar resumen en el log
            this.showEvaluationSummary(evaluation);
            
        } catch (error) {
            this.showError(`Error inesperado: ${error.message}`);
        } finally {
            this.setProcessingState(false);
        }
    }
    
    /**
     * Muestra la evaluación paso a paso
     */
    showStepByStep() {
        if (!this.currentEvaluation || !this.currentEvaluation.machines) {
            this.showError('No hay operaciones para mostrar');
            return;
        }
        
        // Crear un modal o sección expandida para mostrar todas las máquinas
        this.showMachineNavigator();
    }
    
    /**
     * Muestra el navegador de máquinas
     */
    showMachineNavigator() {
        if (!this.currentEvaluation.machines.length) return;
        
        const machines = this.currentEvaluation.machines;
        
        // Crear controles de navegación entre máquinas
        let navigatorHTML = `
            <div class="machine-navigator" style="margin: 15px 0; padding: 15px; background: #f7fafc; border-radius: 8px;">
                <h4>Operaciones Ejecutadas (${machines.length})</h4>
                <div class="machine-list">
        `;
        
        machines.forEach((machineInfo, index) => {
            navigatorHTML += `
                <button class="machine-btn ${index === this.currentMachineIndex ? 'active' : ''}" 
                        onclick="app.loadMachine(${index})"
                        style="margin: 5px; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; 
                               background: ${index === this.currentMachineIndex ? '#667eea' : 'white'};
                               color: ${index === this.currentMachineIndex ? 'white' : 'black'};">
                    ${index + 1}. ${machineInfo.operation}
                </button>
            `;
        });
        
        navigatorHTML += `
                </div>
                <p><small>Haz clic en una operación para ver su Máquina de Turing</small></p>
            </div>
        `;
        
        // Insertar el navegador antes del log de pasos
        const stepsSection = document.querySelector('.steps-section');
        let navigator = stepsSection.querySelector('.machine-navigator');
        
        if (navigator) {
            navigator.remove();
        }
        
        stepsSection.insertAdjacentHTML('afterbegin', navigatorHTML);
    }
    
    /**
     * Carga una máquina específica
     * @param {number} index - Índice de la máquina
     */
    loadMachine(index) {
        if (!this.currentEvaluation || !this.currentEvaluation.machines[index]) {
            return;
        }
        
        this.currentMachineIndex = index;
        const machineInfo = this.currentEvaluation.machines[index];
        
        // Cargar en la visualización
        this.visualization.loadMachine(machineInfo.machine, machineInfo.operation);
        
        // Actualizar botones del navegador
        const buttons = document.querySelectorAll('.machine-btn');
        buttons.forEach((btn, i) => {
            if (i === index) {
                btn.classList.add('active');
                btn.style.background = '#667eea';
                btn.style.color = 'white';
            } else {
                btn.classList.remove('active');
                btn.style.background = 'white';
                btn.style.color = 'black';
            }
        });
    }
    
    /**
     * Muestra un resumen de la evaluación
     * @param {Object} evaluation - Resultado de la evaluación
     */
    showEvaluationSummary(evaluation) {
        const summary = `
            <div class="evaluation-summary" style="background: #e6fffa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4>Resumen de la Evaluación</h4>
                <p><strong>Expresión:</strong> ${evaluation.expression}</p>
                <p><strong>Resultado Binario:</strong> ${evaluation.result.binary}</p>
                <p><strong>Resultado Decimal:</strong> ${evaluation.result.decimal}</p>
                <p><strong>Operaciones Ejecutadas:</strong> ${evaluation.machines.length}</p>
                <details>
                    <summary>Ver pasos detallados</summary>
                    <ol>
                        ${evaluation.steps.map(step => `<li>${step.description}</li>`).join('')}
                    </ol>
                </details>
            </div>
        `;
        
        const stepsLog = document.getElementById('steps-log');
        stepsLog.innerHTML = summary + stepsLog.innerHTML;
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
     * Aplica una corrección sugerida
     * @param {string} correctedExpression - Expresión corregida
     */
    applySuggestedCorrection(correctedExpression) {
        document.getElementById('expression').value = correctedExpression;
        
        // Remover la sugerencia
        const suggestion = document.querySelector('.correction-suggestion');
        if (suggestion) {
            suggestion.remove();
        }
        
        // Calcular automáticamente
        this.calculateExpression();
        
        this.showNotification('Corrección aplicada y calculada', 'success');
    }
    
    /**
     * Reinicia la calculadora
     */
    resetCalculator() {
        // Limpiar input
        document.getElementById('expression').value = '';
        
        // Limpiar visualización
        this.visualization.clear();
        
        // Limpiar datos
        this.currentEvaluation = null;
        this.currentMachineIndex = 0;
        
        // Deshabilitar controles
        document.getElementById('step-btn').disabled = true;
        
        // Remover navegador de máquinas
        const navigator = document.querySelector('.machine-navigator');
        if (navigator) {
            navigator.remove();
        }
        
        // Remover sugerencias de corrección
        const suggestions = document.querySelectorAll('.correction-suggestion');
        suggestions.forEach(suggestion => suggestion.remove());
        
        console.log('🔄 Calculadora reiniciada');
    }
    
    /**
     * Carga un ejemplo aleatorio
     */
    loadRandomExample() {
        const examples = ExpressionParser.getExamples();
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        document.getElementById('expression').value = randomExample;
        
        // Calcular automáticamente
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
        
        // Mostrar notificación temporal
        this.showNotification(message, 'error');
    }
    
    /**
     * Muestra una notificación temporal
     * @param {string} message - Mensaje
     * @param {string} type - Tipo ('success', 'error', 'info')
     */
    showNotification(message, type = 'info') {
        // Crear elemento de notificación
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
        
        // Estilo según tipo
        switch (type) {
            case 'success':
                notification.style.background = '#48bb78';
                break;
            case 'error':
                notification.style.background = '#f56565';
                break;
            default:
                notification.style.background = '#4299e1';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover después de 3 segundos
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
            calculateBtn.textContent = 'Calculando...';
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

// Inicializar aplicación cuando esté lista
let app;

// Función de inicialización global
function initializeApp() {
    app = new BinaryCalculatorApp();
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Exportar para uso global
window.BinaryCalculatorApp = BinaryCalculatorApp;

// Función de ayuda para mostrar información
function showHelp() {
    const helpText = `
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h3>🤖 Ayuda - Calculadora Binaria con Máquinas de Turing</h3>
            
            <h4>Operadores Soportados:</h4>
            <ul>
                <li><strong>+</strong> : Suma</li>
                <li><strong>-</strong> : Resta</li>
                <li><strong>* o x</strong> : Multiplicación</li>
                <li><strong>/ o ÷</strong> : División</li>
                <li><strong>( )</strong> : Paréntesis para cambiar precedencia</li>
            </ul>
            
            <h4>Ejemplos de Expresiones:</h4>
            <ul>
                <li><strong>Básicas:</strong> 101 + 110, 1010 - 101, 11 * 10</li>
                <li><strong>Múltiples:</strong> 101 + 110 - 11 * 10</li>
                <li><strong>Con paréntesis:</strong> (101 + 110) * 10</li>
                <li><strong>Complejas:</strong> 11 + (1100 - 101), (10 + 11) * (11 - 1)</li>
                <li><strong>Anidadas:</strong> ((101 + 110) - 11) * 10</li>
            </ul>
            
            <h4>Características:</h4>
            <ul>
                <li>✅ Visualización de la cinta de la Máquina de Turing</li>
                <li>✅ Navegación paso a paso</li>
                <li>✅ Reproducción automática</li>
                <li>✅ Soporte para expresiones múltiples</li>
                <li>✅ Paréntesis para cambiar orden de operaciones</li>
                <li>✅ Corrección automática de errores comunes</li>
                <li>✅ Resultados en binario y decimal</li>
            </ul>
            
            <h4>Consejos:</h4>
            <ul>
                <li>🎲 Doble clic en el campo de entrada para un ejemplo aleatorio</li>
                <li>⌨️ Presiona Enter para calcular</li>
                <li>👆 Haz clic en los pasos para navegar directamente</li>
                <li>🔧 La calculadora corrige automáticamente errores como 101 ++ 110 → 101 + 110</li>
                <li>📐 Usa paréntesis para expresiones como (101 + 110) * 10</li>
            </ul>
            
            <h4>Corrección Automática:</h4>
            <ul>
                <li><strong>Operadores dobles:</strong> ++ → +, xx → *, ** → *</li>
                <li><strong>Paréntesis:</strong> 101 + (110 → 101 + (110)</li>
                <li><strong>Multiplicación implícita:</strong> (101)(110) → (101)*(110)</li>
                <li><strong>Espacios:</strong> 101  +   110 → 101 + 110</li>
            </ul>
        </div>
    `;
    
    const stepsLog = document.getElementById('steps-log');
    stepsLog.innerHTML = helpText;
}

// Agregar botón de ayuda
document.addEventListener('DOMContentLoaded', () => {
    const helpButton = document.createElement('button');
    helpButton.textContent = '❓ Ayuda';
    helpButton.className = 'control-btn';
    helpButton.style.background = '#4299e1';
    helpButton.onclick = showHelp;
    
    const controls = document.querySelector('.controls');
    if (controls) {
        controls.appendChild(helpButton);
    }
});