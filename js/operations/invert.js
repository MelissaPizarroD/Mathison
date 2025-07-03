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

// MÁQUINA ULTRA SIMPLE - SIN BUCLES
class InvertSumTuringMachine extends BaseTuringMachine {
    constructor() {
        super();
        this.maxSteps = 150;
        this.currentPhase = 'INICIAL';
        this.simboloParaEscribir = '';
    }

    initialize(sumExpression) {
        this.logStep(`🚀 INICIO: "${sumExpression}"`);
        
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
        this.currentPhase = 'AGREGAR_IGUAL';
        this.simboloParaEscribir = '';
        
        this.logStep(`📋 Cinta inicial: [${this.tape.join(', ')}]`);
        return true;
    }

    executeStep() {
        this.stepCount++;
        
        if (this.stepCount > this.maxSteps) {
            this.logStep(`⏹️ LÍMITE ALCANZADO en paso ${this.maxSteps}`);
            this.extraerResultadoFinal();
            this.state = 'COMPLETO';
            return false;
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
                    this.currentPhase = 'PROCESAR_SEGUNDO_NUMERO';
                    this.state = 'IR_A_SEGUNDO_NUMERO';
                    this.logStep('✅ = agregado al final, procesando segundo número');
                } else {
                    this.moveRight();
                }
                break;

            // FASE 1: PROCESAR SEGUNDO NÚMERO (después del +)
            case 'IR_A_SEGUNDO_NUMERO':
                if (symbol === '=') {
                    this.moveLeft(); // Ir hacia el segundo número
                    this.state = 'BUSCAR_ULTIMO_DIGITO_SEGUNDO';
                    this.logStep('Posicionándose para encontrar último dígito del segundo número');
                } else {
                    this.moveLeft();
                }
                break;

            case 'BUSCAR_ULTIMO_DIGITO_SEGUNDO':
                if (symbol === '0' || symbol === '1') {
                    // Encontramos el dígito más a la derecha del segundo número
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
                    this.moveLeft(); // Buscar el siguiente dígito hacia la izquierda
                    this.state = 'BUSCAR_SIGUIENTE_SEGUNDO';
                    this.logStep('Buscando siguiente dígito del segundo número hacia la izquierda');
                } else {
                    this.moveLeft();
                }
                break;

            case 'BUSCAR_SIGUIENTE_SEGUNDO':
                if (symbol === '0' || symbol === '1') {
                    // Encontrado siguiente dígito del segundo número
                    this.simboloParaEscribir = symbol;
                    this.writeSymbol('X');
                    this.moveRight();
                    this.state = 'ESCRIBIR_SEGUNDO_SIGUIENTE';
                    this.logStep(`✅ Siguiente dígito del segundo número: '${symbol}' → X`);
                } else if (symbol === '+') {
                    // Ya no hay más dígitos en el segundo número
                    this.currentPhase = 'AGREGAR_PLUS_SEGUNDO';
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
                    this.moveRight(); // Pasar los dígitos ya escritos
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
                    this.currentPhase = 'PROCESAR_PRIMER_NUMERO';
                    this.state = 'IR_A_PRIMER_NUMERO';
                    this.logStep('✅ + agregado después del segundo número invertido');
                } else if (symbol === '0' || symbol === '1') {
                    this.moveRight(); // Pasar los dígitos ya escritos del segundo número
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
                    this.moveLeft(); // Ir al último dígito del primer número
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
                    this.moveLeft(); // Continuar buscando hacia la izquierda
                } else if (symbol === '#') {
                    // Ya no hay más dígitos en el primer número
                    this.currentPhase = 'LIMPIAR';
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
                    this.moveRight(); // Pasar el segundo número invertido
                } else if (symbol === '+') {
                    this.moveRight(); // Pasar el + del resultado
                } else if (symbol === '#') {
                    this.writeSymbol(this.simboloParaEscribir);
                    this.moveRight();
                    this.writeSymbol('#');
                    this.state = 'REGRESAR_A_Y_PRIMER';
                    this.logStep(`✅ Escrito '${this.simboloParaEscribir}' del primer número`);
                } else if (symbol === 'X') {
                    this.moveRight(); // Pasar marcadores del segundo número
                } else {
                    this.moveRight();
                }
                break;

            case 'REGRESAR_A_Y_PRIMER':
                if (symbol === 'Y') {
                    this.moveLeft(); // Buscar siguiente dígito hacia la izquierda
                    this.state = 'PROCESAR_DIGITO_PRIMER';
                } else {
                    this.moveLeft();
                }
                break;

            // FASE 3: LIMPIAR TODO ANTES DEL = (INCLUYENDO EL =)
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
                    // Encontramos el =, también lo borramos
                    this.writeSymbol('#');
                    this.moveRight();
                    this.logStep('Encontrado =, borrándolo también');
                    // Ahora extraer lo que queda
                    this.extraerResultadoFinal();
                    this.state = 'COMPLETO';
                } else if (symbol === '#') {
                    // Es un espacio vacío, solo continuar
                    this.moveRight();
                } else {
                    // Cualquier otro símbolo antes del =, borrarlo
                    this.writeSymbol('#');
                    this.moveRight();
                    this.logStep(`Borrando '${symbol}' antes del = → #`);
                }
                break;

            case 'COMPLETO':
                this.logStep('🎉 ¡INVERSIÓN COMPLETADA!');
                return false;

            default:
                this.logStep(`❌ Estado desconocido: ${this.state}`);
                this.extraerResultadoFinal();
                this.state = 'COMPLETO';
                return false;
        }
        
        return true;
    }

    extraerResultadoFinal() {
        this.logStep('🔍 Extrayendo resultado final y compactando cinta...');
        this.logStep(`📋 Cinta antes de compactar: [${this.tape.join(', ')}]`);
        
        // Extraer SOLO los caracteres válidos (0, 1, +) ignorando todos los #
        let resultado = '';
        for (let i = 0; i < this.tape.length; i++) {
            let sym = this.tape[i];
            if (sym === '0' || sym === '1' || sym === '+') {
                resultado += sym;
            }
        }
        
        if (resultado) {
            this.logStep(`📊 RESULTADO EXTRAÍDO: "${resultado}"`);
            
            // RECONSTRUIR CINTA COMPLETAMENTE: # + resultado + #
            this.tape = ['#'];
            for (let char of resultado) {
                this.tape.push(char);
            }
            this.tape.push('#');
            
            // Posicionar cabezal al inicio del resultado
            this.head = 1;
            
            this.logStep(`✅ Cinta compactada: [${this.tape.join(', ')}]`);
        } else {
            this.logStep('⚠️ No se encontró resultado válido para extraer');
            // Cinta mínima si no hay resultado
            this.tape = ['#', '#'];
            this.head = 1;
        }
        
        this.logStep(`📋 CINTA FINAL COMPACTA: [${this.tape.join(', ')}]`);
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