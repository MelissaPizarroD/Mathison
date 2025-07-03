// js/operations/invert.js

// Máquina individual simple
class InvertTuringMachine extends BaseTuringMachine {
    constructor() {
        super();
        this.simboloParaEscribir = '';
        this.maxSteps = 1000;
    }

    initialize(number) {
        this.tape = ['#'];
        for (let char of number) {
            this.tape.push(char);
        }
        this.tape.push('#');
        
        this.head = 0;
        this.stepCount = 0;
        this.steps = [];
        this.running = false;
        this.state = 'INICIO';
        this.simboloParaEscribir = '';
        
        this.logStep('Máquina de inversión inicializada: ' + number);
        return true;
    }

    executeStep() {
        this.stepCount++;
        let symbol = this.getCurrentSymbol();
        
        switch (this.state) {
            case 'INICIO':
                if (symbol === '#' && this.head === 0) {
                    this.moveRight();
                    this.state = 'BUSCAR_FINAL';
                } else {
                    this.moveRight();
                }
                break;

            case 'BUSCAR_FINAL':
                if (symbol === '#') {
                    this.moveLeft();
                    this.state = 'PROCESAR_ULTIMO_SIMBOLO';
                } else {
                    this.moveRight();
                }
                break;

            case 'PROCESAR_ULTIMO_SIMBOLO':
                if (symbol === '0' || symbol === '1') {
                    this.simboloParaEscribir = symbol;
                    this.writeSymbol('X');
                    this.moveRight();
                    this.state = 'ESCRIBIR_AL_FINAL';
                } else if (symbol === 'X') {
                    this.moveLeft();
                } else if (symbol === '#') {
                    this.moveRight();
                    this.state = 'LIMPIAR_MARCADORES';
                } else {
                    this.moveLeft();
                }
                break;

            case 'ESCRIBIR_AL_FINAL':
                if (symbol === '#') {
                    this.writeSymbol(this.simboloParaEscribir);
                    this.moveRight();
                    this.writeSymbol('#');
                    this.moveLeft();
                    this.moveLeft();
                    this.state = 'REGRESAR_A_X';
                } else {
                    this.moveRight();
                }
                break;

            case 'REGRESAR_A_X':
                if (symbol === 'X') {
                    this.moveLeft();
                    this.state = 'PROCESAR_ULTIMO_SIMBOLO';
                } else {
                    this.moveLeft();
                }
                break;

            case 'LIMPIAR_MARCADORES':
                if (symbol === 'X') {
                    this.writeSymbol('#');
                    this.moveRight();
                } else if (symbol === '#') {
                    let hayMasX = false;
                    for (let i = 0; i < this.tape.length; i++) {
                        if (this.tape[i] === 'X') {
                            hayMasX = true;
                            break;
                        }
                    }
                    if (!hayMasX) {
                        this.reorganizarCinta();
                        this.state = 'COMPLETO';
                    } else {
                        this.moveRight();
                    }
                } else {
                    this.moveRight();
                }
                break;

            case 'COMPLETO':
                return false;
        }
        
        return true;
    }

    reorganizarCinta() {
        let nuevaCinta = ['#'];
        let numeroInvertido = '';
        
        for (let i = 1; i < this.tape.length - 1; i++) {
            if (this.tape[i] === '0' || this.tape[i] === '1') {
                numeroInvertido += this.tape[i];
            }
        }
        
        for (let char of numeroInvertido) {
            nuevaCinta.push(char);
        }
        nuevaCinta.push('#');
        
        this.tape = nuevaCinta;
        this.head = 1;
        this.logStep(`Número invertido: ${numeroInvertido}`);
    }
}

// MÁQUINA MEJORADA QUE INVIERTE Y LUEGO SUMA
class InvertSumTuringMachine extends BaseTuringMachine {
    constructor() {
        super();
        this.maxSteps = 300;
        this.currentPhase = 'INVERTIR';
        this.simboloParaEscribir = '';
        this.sumMachine = null; // Referencia a la máquina de suma
        this.invertedExpression = ''; // Para almacenar la expresión invertida
    }

    initialize(sumExpression) {
        this.logStep(`🚀 INICIO INVERSIÓN+SUMA: "${sumExpression}"`);
        
        let clean = '';
        for (let char of sumExpression) {
            if (char === '0' || char === '1' || char === '+') {
                clean += char;
            }
        }
        
        this.tape = ['#'];
        for (let char of clean) {
            this.tape.push(char);
        }
        this.tape.push('#');
        
        this.head = 0;
        this.stepCount = 0;
        this.steps = [];
        this.running = false;
        this.state = 'INICIO';
        this.currentPhase = 'INVERTIR';
        this.simboloParaEscribir = '';
        this.sumMachine = null;
        this.invertedExpression = '';
        
        this.logStep(`📋 Cinta inicial: [${this.tape.join(', ')}]`);
        return true;
    }

    executeStep() {
        this.stepCount++;
        
        if (this.stepCount > this.maxSteps) {
            this.logStep(`⏹️ LÍMITE ALCANZADO en paso ${this.maxSteps}`);
            this.state = 'COMPLETO';
            return false;
        }

        // Si estamos en fase de suma, delegar a la máquina de suma
        if (this.currentPhase === 'SUMAR' && this.sumMachine) {
            let continuar = this.sumMachine.executeStep();
            
            // Actualizar nuestra cinta y cabezal con el estado de la máquina de suma
            this.tape = [...this.sumMachine.tape];
            this.head = this.sumMachine.head;
            
            // Log del progreso de la suma
            this.logStep(`SUMA: Estado=${this.sumMachine.state}, Pos=${this.sumMachine.head}, Símbolo='${this.sumMachine.getCurrentSymbol()}'`);
            
            if (!continuar) {
                // La suma ha terminado
                this.state = 'COMPLETO';
                this.logStep(`🎉 SUMA COMPLETADA! Resultado final: [${this.tape.join(', ')}]`);
                return false;
            }
            return true;
        }
        
        let symbol = this.getCurrentSymbol();
        this.logStep(`🔍 Paso ${this.stepCount}: ${this.state} | Pos:${this.head} | '${symbol}'`);
        
        switch (this.state) {
            case 'INICIO':
                if (symbol === '#' && this.head === 0) {
                    this.moveRight();
                    this.state = 'BUSCAR_FINAL_ORIGINAL';
                } else {
                    this.moveRight();
                }
                break;

            case 'BUSCAR_FINAL_ORIGINAL':
                if (symbol === '#') {
                    this.writeSymbol('=');
                    this.moveRight();
                    this.writeSymbol('#');
                    this.state = 'IR_A_SEGUNDO_NUMERO';
                    this.logStep('✅ = agregado al final, procesando segundo número');
                } else {
                    this.moveRight();
                }
                break;

            // FASE 1: PROCESAR SEGUNDO NÚMERO (después del +)
            case 'IR_A_SEGUNDO_NUMERO':
                if (symbol === '=') {
                    this.moveLeft();
                    this.state = 'BUSCAR_ULTIMO_DIGITO_SEGUNDO';
                    this.logStep('Posicionándose para encontrar último dígito del segundo número');
                } else {
                    this.moveLeft();
                }
                break;

            case 'BUSCAR_ULTIMO_DIGITO_SEGUNDO':
                if (symbol === '0' || symbol === '1') {
                    this.simboloParaEscribir = symbol;
                    this.writeSymbol('X');
                    this.moveRight();
                    this.state = 'ESCRIBIR_SEGUNDO_DERECHA';
                    this.logStep(`✅ Último dígito del segundo número: '${symbol}' → X`);
                } else {
                    this.moveLeft();
                }
                break;

            case 'ESCRIBIR_SEGUNDO_DERECHA':
                if (symbol === '=') {
                    this.moveRight();
                } else if (symbol === '#') {
                    this.writeSymbol(this.simboloParaEscribir);
                    this.moveRight();
                    this.writeSymbol('#');
                    this.state = 'REGRESAR_A_X_SEGUNDO';
                    this.logStep(`✅ Escrito '${this.simboloParaEscribir}' del segundo número`);
                } else {
                    this.moveRight();
                }
                break;

            case 'REGRESAR_A_X_SEGUNDO':
                if (symbol === 'X') {
                    this.moveLeft();
                    this.state = 'BUSCAR_SIGUIENTE_SEGUNDO';
                    this.logStep('Buscando siguiente dígito del segundo número hacia la izquierda');
                } else {
                    this.moveLeft();
                }
                break;

            case 'BUSCAR_SIGUIENTE_SEGUNDO':
                if (symbol === '0' || symbol === '1') {
                    this.simboloParaEscribir = symbol;
                    this.writeSymbol('X');
                    this.moveRight();
                    this.state = 'ESCRIBIR_SEGUNDO_SIGUIENTE';
                    this.logStep(`✅ Siguiente dígito del segundo número: '${symbol}' → X`);
                } else if (symbol === '+') {
                    this.state = 'BUSCAR_FINAL_PARA_PLUS_SEGUNDO';
                    this.logStep('✅ Segundo número completado, agregando + al resultado');
                } else {
                    this.moveLeft();
                }
                break;

            case 'ESCRIBIR_SEGUNDO_SIGUIENTE':
                if (symbol === '=') {
                    this.moveRight();
                } else if (symbol === '0' || symbol === '1') {
                    this.moveRight();
                } else if (symbol === '#') {
                    this.writeSymbol(this.simboloParaEscribir);
                    this.moveRight();
                    this.writeSymbol('#');
                    this.state = 'REGRESAR_A_X_SEGUNDO';
                    this.logStep(`✅ Escrito '${this.simboloParaEscribir}' del segundo número`);
                } else {
                    this.moveRight();
                }
                break;

            case 'BUSCAR_FINAL_PARA_PLUS_SEGUNDO':
                if (symbol === '#') {
                    this.writeSymbol('+');
                    this.moveRight();
                    this.writeSymbol('#');
                    this.state = 'IR_A_PRIMER_NUMERO';
                    this.logStep('✅ + agregado después del segundo número invertido');
                } else if (symbol === '0' || symbol === '1') {
                    this.moveRight();
                } else {
                    this.moveRight();
                }
                break;

            // FASE 2: PROCESAR PRIMER NÚMERO (antes del +)
            case 'IR_A_PRIMER_NUMERO':
                if (symbol === '#' && this.head === 0) {
                    this.moveRight();
                    this.state = 'BUSCAR_ULTIMO_DIGITO_PRIMER';
                    this.logStep('Posicionándose para procesar primer número');
                } else {
                    this.moveLeft();
                }
                break;

            case 'BUSCAR_ULTIMO_DIGITO_PRIMER':
                if (symbol === '+') {
                    this.moveLeft();
                    this.state = 'PROCESAR_DIGITO_PRIMER';
                } else {
                    this.moveRight();
                }
                break;

            case 'PROCESAR_DIGITO_PRIMER':
                if (symbol === '0' || symbol === '1') {
                    this.simboloParaEscribir = symbol;
                    this.writeSymbol('Y');
                    this.moveRight();
                    this.state = 'ESCRIBIR_PRIMER_DERECHA';
                    this.logStep(`✅ Dígito del primer número: '${symbol}' → Y`);
                } else if (symbol === 'Y') {
                    this.moveLeft();
                } else if (symbol === '#') {
                    this.state = 'LIMPIAR_MARCADORES';
                    this.logStep('✅ Primer número completado, iniciando limpieza');
                } else {
                    this.moveLeft();
                }
                break;

            case 'ESCRIBIR_PRIMER_DERECHA':
                if (symbol === '+') {
                    this.moveRight();
                    this.state = 'ESCRIBIR_PRIMER_DESPUES_PLUS';
                } else {
                    this.moveRight();
                }
                break;

            case 'ESCRIBIR_PRIMER_DESPUES_PLUS':
                if (symbol === '0' || symbol === '1') {
                    this.moveRight();
                } else if (symbol === '+') {
                    this.moveRight();
                } else if (symbol === '#') {
                    this.writeSymbol(this.simboloParaEscribir);
                    this.moveRight();
                    this.writeSymbol('#');
                    this.state = 'REGRESAR_A_Y_PRIMER';
                    this.logStep(`✅ Escrito '${this.simboloParaEscribir}' del primer número`);
                } else if (symbol === 'X') {
                    this.moveRight();
                } else {
                    this.moveRight();
                }
                break;

            case 'REGRESAR_A_Y_PRIMER':
                if (symbol === 'Y') {
                    this.moveLeft();
                    this.state = 'PROCESAR_DIGITO_PRIMER';
                } else {
                    this.moveLeft();
                }
                break;

            // FASE 3: LIMPIAR Y PREPARAR PARA SUMA
            case 'LIMPIAR_MARCADORES':
                if (symbol === '#' && this.head === 0) {
                    this.moveRight();
                    this.state = 'BUSCAR_Y_LIMPIAR_HASTA_IGUAL';
                    this.logStep('Iniciando limpieza: borrando todo hasta encontrar =');
                } else {
                    this.moveLeft();
                }
                break;

            case 'BUSCAR_Y_LIMPIAR_HASTA_IGUAL':
                if (symbol === '=') {
                    this.writeSymbol('#');
                    this.moveRight();
                    this.logStep('Encontrado =, borrándolo también');
                    
                    // Después de limpiar hasta el =, extraer la expresión y comenzar suma
                    this.extraerExpresionInvertida();
                    
                    // Verificar que tenemos una expresión válida antes de iniciar suma
                    if (this.invertedExpression && this.invertedExpression.includes('+')) {
                        this.iniciarSuma();
                    } else {
                        this.logStep(`❌ Expresión invertida inválida: "${this.invertedExpression}"`);
                        this.state = 'COMPLETO';
                    }
                    
                    return true; // Importante: retornar aquí para no continuar el bucle
                } else if (symbol === '#') {
                    this.moveRight();
                } else {
                    this.writeSymbol('#');
                    this.moveRight();
                    this.logStep(`Borrando '${symbol}' antes del = → #`);
                }
                break;

            case 'COMPLETO':
                this.logStep('🎉 ¡INVERSIÓN Y SUMA COMPLETADAS!');
                return false;

            default:
                this.logStep(`❌ Estado desconocido: ${this.state}`);
                this.state = 'COMPLETO';
                return false;
        }
        
        return true;
    }

    extraerExpresionInvertida() {
        this.logStep('🔍 Extrayendo expresión invertida...');
        this.logStep(`📋 Cinta antes de extraer: [${this.tape.join(', ')}]`);
        
        let resultado = '';
        for (let i = 0; i < this.tape.length; i++) {
            let sym = this.tape[i];
            if (sym === '0' || sym === '1' || sym === '+') {
                resultado += sym;
            }
        }
        
        this.invertedExpression = resultado;
        this.logStep(`📊 EXPRESIÓN INVERTIDA: "${this.invertedExpression}"`);
    }

    iniciarSuma() {
        this.logStep(`🔢 INICIANDO SUMA de la expresión invertida: "${this.invertedExpression}"`);
        
        // Separar los números para pasárselos a la máquina de suma
        let parts = this.invertedExpression.split('+');
        if (parts.length === 2) {
            let num1 = parts[0];
            let num2 = parts[1];
            
            this.logStep(`📝 Números a sumar: "${num1}" + "${num2}"`);
            
            // Validar que los números no estén vacíos
            if (!num1) num1 = '0';
            if (!num2) num2 = '0';
            
            // Crear y configurar la máquina de suma
            this.sumMachine = new SumTuringMachine();
            
            if (this.sumMachine.initialize(num1, num2)) {
                this.currentPhase = 'SUMAR';
                this.state = 'SUMANDO';
                
                // Copiar el estado inicial de la máquina de suma
                this.tape = [...this.sumMachine.tape];
                this.head = this.sumMachine.head;
                
                this.logStep('✅ Máquina de suma inicializada correctamente');
                this.logStep(`📋 Cinta inicial para suma: [${this.tape.join(', ')}]`);
                this.logStep(`🎯 Posición inicial del cabezal: ${this.head}`);
            } else {
                this.logStep('❌ Error al inicializar la máquina de suma');
                this.state = 'COMPLETO';
            }
        } else {
            this.logStep('❌ Error: no se pudo separar la expresión en dos números');
            this.logStep(`📊 Partes encontradas: ${parts.length}, contenido: [${parts.join(', ')}]`);
            this.state = 'COMPLETO';
        }
    }
}

function initializeInversion(number) {
    const invertMachine = new InvertTuringMachine();
    if (invertMachine.initialize(number)) {
        return invertMachine;
    }
    return null;
}

function initializeInversionSum(sumExpression) {
    const invertSumMachine = new InvertSumTuringMachine();
    if (invertSumMachine.initialize(sumExpression)) {
        return invertSumMachine;
    }
    return null;
}