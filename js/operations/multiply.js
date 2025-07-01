// js/operations/multiply.js
class MultiplyTuringMachine extends BaseTuringMachine {
    constructor() {
        super();
        this.multiplierBit = 0;
        this.multiplicand = '';
        this.multiplier = '';
        this.processedDigitThisCycle = false;
        this.currentShift = 0;
        this.partialProducts = [];
        this.currentPartialProduct = '';
        this.sumMachine = null;
        this.isUsingSumMachine = false;
        this.sumResult = '';
        this.accumulatedResult = '0';
    }

    initialize(num1, num2) {
        if (!this.validateBinaryInput(num1, num2)) {
            return false;
        }

        this.multiplicand = num1;
        this.multiplier = num2;
        this.partialProducts = [];
        this.currentShift = 0;
        this.accumulatedResult = '0';
        this.isUsingSumMachine = false;

        this.initializeBaseTape(num1, num2, '*');
        this.state = 'INICIO';
        this.logStep(`Máquina inicializada para multiplicación: ${num1} * ${num2}`);
        this.logStep(`Algoritmo: Generar productos parciales y sumarlos usando máquina de suma`);
        return true;
    }

    executeStep() {
        this.stepCount++;
        let symbol = this.getCurrentSymbol();
        
        // Si estamos usando la máquina de suma, delegamos a ella
        if (this.isUsingSumMachine && this.sumMachine) {
            if (this.sumMachine.state !== 'COMPLETO') {
                let continueSum = this.sumMachine.executeStep();
                this.tape = [...this.sumMachine.tape];
                this.head = this.sumMachine.head;
                
                // Transferir el log de la máquina de suma
                if (this.sumMachine.steps.length > 0) {
                    let lastSumStep = this.sumMachine.steps[this.sumMachine.steps.length - 1];
                    this.logStep(`[SUMA] ${lastSumStep.description}`);
                }
                
                if (!continueSum || this.sumMachine.state === 'COMPLETO') {
                    this.extractSumResult();
                    this.isUsingSumMachine = false;
                    this.sumMachine = null;
                    this.state = 'CONTINUAR_MULTIPLICACION';
                    this.logStep(`Suma completada. Resultado acumulado: ${this.accumulatedResult}`);
                }
                return true;
            }
        }
        
        switch (this.state) {
            case 'INICIO':
                if (symbol === '*') {
                    this.moveRight();
                    this.state = 'IR_AL_FINAL_MULTIPLICADOR';
                    this.logStep('Encontrado *, moviéndose al final del multiplicador');
                } else {
                    this.moveRight();
                    this.logStep('Buscando el símbolo *');
                }
                break;

            case 'IR_AL_FINAL_MULTIPLICADOR':
                if (symbol === '#') {
                    this.moveLeft();
                    this.state = 'OBTENER_BIT_MULTIPLICADOR';
                    this.logStep('Alcanzado final, procesando multiplicador de derecha a izquierda');
                } else {
                    this.moveRight();
                    this.logStep('Moviéndose al final del multiplicador');
                }
                break;

            case 'OBTENER_BIT_MULTIPLICADOR':
                if (symbol === '0' || symbol === '1') {
                    this.multiplierBit = parseInt(symbol);
                    this.writeSymbol('X');
                    this.processedDigitThisCycle = true;
                    this.logStep(`Bit del multiplicador: ${this.multiplierBit}, marcado como X`);
                    
                    if (this.multiplierBit === 1) {
                        this.state = 'GENERAR_PRODUCTO_PARCIAL';
                        this.logStep(`Bit es 1, generando producto parcial: ${this.multiplicand} con ${this.currentShift} desplazamientos`);
                    } else {
                        this.currentShift++;
                        this.state = 'SIGUIENTE_BIT_MULTIPLICADOR';
                        this.logStep(`Bit es 0, saltando (producto parcial = 0), incrementando desplazamiento a ${this.currentShift}`);
                    }
                } else if (symbol === '*') {
                    this.state = 'MOSTRAR_RESULTADO_FINAL';
                    this.logStep('Terminado procesamiento de multiplicador');
                } else {
                    this.moveLeft();
                    this.logStep('Buscando siguiente bit no procesado del multiplicador');
                }
                break;

            case 'GENERAR_PRODUCTO_PARCIAL':
                // Generar producto parcial = multiplicando + desplazamiento
                this.currentPartialProduct = this.multiplicand;
                for (let i = 0; i < this.currentShift; i++) {
                    this.currentPartialProduct += '0';
                }
                
                this.partialProducts.push(this.currentPartialProduct);
                this.logStep(`Producto parcial ${this.partialProducts.length}: ${this.currentPartialProduct}`);
                this.state = 'PREPARAR_SUMA';
                break;

            case 'PREPARAR_SUMA':
                this.logStep(`Preparando suma: ${this.accumulatedResult} + ${this.currentPartialProduct}`);
                
                // Crear nueva máquina de suma
                this.sumMachine = new SumTuringMachine();
                
                // Inicializar la máquina de suma con el resultado acumulado y el producto parcial actual
                if (this.sumMachine.initialize(this.accumulatedResult, this.currentPartialProduct)) {
                    this.isUsingSumMachine = true;
                    this.tape = [...this.sumMachine.tape];
                    this.head = this.sumMachine.head;
                    this.logStep('Máquina de suma inicializada, comenzando suma de productos parciales');
                } else {
                    this.logStep('Error al inicializar máquina de suma');
                    this.state = 'COMPLETO';
                }
                break;

            case 'CONTINUAR_MULTIPLICACION':
                this.currentShift++;
                this.state = 'REGRESAR_AL_INICIO';
                this.logStep(`Incrementando desplazamiento a ${this.currentShift}, regresando para siguiente bit`);
                break;

            case 'REGRESAR_AL_INICIO':
                if (symbol === '#' && this.head === 0) {
                    this.moveRight();
                    this.state = 'VERIFICAR_MAS_BITS';
                    this.logStep('Regresado al inicio, verificando más bits del multiplicador');
                } else {
                    this.moveLeft();
                    this.logStep('Regresando al inicio de la cinta');
                }
                break;

            case 'VERIFICAR_MAS_BITS':
                if (!this.processedDigitThisCycle) {
                    let hasUnprocessedBits = false;
                    
                    // Buscar en el multiplicador original (después del *)
                    let originalMultiplierStart = -1;
                    let foundStar = false;
                    
                    for (let i = 1; i < this.tape.length; i++) {
                        if (this.tape[i] === '*' && !foundStar) {
                            originalMultiplierStart = i + 1;
                            foundStar = true;
                            continue;
                        }
                        if (foundStar && (this.tape[i] === '=' || this.tape[i] === '#')) {
                            break;
                        }
                        if (foundStar && (this.tape[i] === '0' || this.tape[i] === '1')) {
                            hasUnprocessedBits = true;
                            this.logStep(`Encontrado bit no procesado '${this.tape[i]}' en posición ${i}`);
                            break;
                        }
                    }
                    
                    if (hasUnprocessedBits) {
                        this.processedDigitThisCycle = false;
                        this.head = 0;
                        this.state = 'INICIO';
                        this.logStep('Encontrados más bits, continuando multiplicación');
                        return true;
                    } else {
                        this.state = 'MOSTRAR_RESULTADO_FINAL';
                        this.logStep('Todos los bits procesados, mostrando resultado final');
                        return true;
                    }
                }
                
                this.processedDigitThisCycle = false;
                
                // Buscar el * original para continuar
                if (symbol === '*') {
                    this.moveRight();
                    this.state = 'IR_AL_FINAL_MULTIPLICADOR';
                    this.logStep('Continuando con siguiente bit del multiplicador');
                } else {
                    this.moveRight();
                    this.logStep('Buscando * para continuar procesamiento');
                }
                break;

            case 'SIGUIENTE_BIT_MULTIPLICADOR':
                this.state = 'REGRESAR_AL_INICIO';
                this.logStep('Continuando con siguiente bit del multiplicador');
                break;

            case 'MOSTRAR_RESULTADO_FINAL':
                this.logStep('=== RESUMEN DE MULTIPLICACIÓN ===');
                this.logStep(`Multiplicando: ${this.multiplicand}`);
                this.logStep(`Multiplicador: ${this.multiplier}`);
                this.logStep('Productos parciales generados:');
                
                for (let i = 0; i < this.partialProducts.length; i++) {
                    this.logStep(`  ${i + 1}. ${this.partialProducts[i]}`);
                }
                
                // Mostrar el resultado final en la cinta
                this.tape = ['#'];
                for (let digit of this.accumulatedResult) {
                    this.tape.push(digit);
                }
                this.tape.push('#');
                this.head = 1;
                this.state = 'COMPLETO';
                
                this.logStep(`Resultado final: ${this.accumulatedResult}`);
                this.logStep(`Verificación: ${this.multiplicand} * ${this.multiplier} = ${this.accumulatedResult}`);
                this.logStep(`En decimal: ${parseInt(this.multiplicand, 2)} * ${parseInt(this.multiplier, 2)} = ${parseInt(this.accumulatedResult, 2)}`);
                break;

            case 'COMPLETO':
                this.logStep('¡Multiplicación binaria completa!');
                return false;
        }
        
        return true;
    }

    extractSumResult() {
        // Extraer el resultado de la suma de la cinta
        let result = '';
        
        // Buscar todos los dígitos binarios en la cinta después del primer #
        for (let i = 1; i < this.tape.length; i++) {
            if (this.tape[i] === '#') {
                break;
            }
            if (this.tape[i] === '0' || this.tape[i] === '1') {
                result += this.tape[i];
            }
        }
        
        // Si no encontramos resultado, usar '0'
        if (result === '') {
            result = '0';
        }
        
        this.accumulatedResult = result;
        this.logStep(`Resultado extraído de la suma: ${result}`);
    }
}