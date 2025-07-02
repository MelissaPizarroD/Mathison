// js/operations/invert.js
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
        
        this.logStep('Máquina de inversión inicializada con número individual: ' + number);
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
                    this.logStep('Iniciando inversión de número individual');
                } else {
                    this.moveRight();
                    this.logStep('Buscando inicio del número');
                }
                break;

            case 'BUSCAR_FINAL':
                if (symbol === '#') {
                    this.moveLeft();
                    this.state = 'PROCESAR_ULTIMO_SIMBOLO';
                    this.logStep('Encontrado final, comenzando inversión desde el último dígito');
                } else {
                    this.moveRight();
                    this.logStep('Buscando final del número');
                }
                break;

            case 'PROCESAR_ULTIMO_SIMBOLO':
                if (symbol === '0' || symbol === '1') {
                    this.simboloParaEscribir = symbol;
                    this.writeSymbol('X');
                    this.moveRight();
                    this.state = 'ESCRIBIR_AL_FINAL';
                    this.logStep(`Marcado último dígito ${symbol} como X, escribiéndolo al final`);
                } else if (symbol === 'X') {
                    this.moveLeft();
                    this.logStep('Dígito ya procesado, continuando hacia la izquierda');
                } else if (symbol === '#') {
                    this.moveRight();
                    this.state = 'LIMPIAR_MARCADORES';
                    this.logStep('Inversión completada, limpiando marcadores');
                } else {
                    this.moveLeft();
                    this.logStep('Buscando siguiente dígito para procesar');
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
                    this.logStep(`Escrito ${this.simboloParaEscribir} al final, regresando para continuar`);
                } else {
                    this.moveRight();
                    this.logStep('Buscando final para escribir dígito');
                }
                break;

            case 'REGRESAR_A_X':
                if (symbol === 'X') {
                    this.moveLeft();
                    this.state = 'PROCESAR_ULTIMO_SIMBOLO';
                    this.logStep('Encontrada marca X, continuando con siguiente dígito');
                } else {
                    this.moveLeft();
                    this.logStep('Regresando para encontrar marca X');
                }
                break;

            case 'LIMPIAR_MARCADORES':
                if (symbol === 'X') {
                    this.writeSymbol('#');
                    this.moveRight();
                    this.logStep('Limpiando marcador X');
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
                        this.logStep('Inversión de número individual completada');
                    } else {
                        this.moveRight();
                        this.logStep('Continuando búsqueda de marcadores');
                    }
                } else {
                    this.moveRight();
                    this.logStep('Continuando limpieza de marcadores');
                }
                break;

            case 'COMPLETO':
                this.logStep('¡Inversión de número binario individual completa!');
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

// Clase ULTRA SIMPLE para invertir estructura número+número
class InvertSumTuringMachine extends BaseTuringMachine {
    constructor() {
        super();
        this.simboloParaEscribir = '';
        this.maxSteps = 1000;
    }

    initialize(sumExpression) {
        this.logStep(`Inicializando con: "${sumExpression}"`);
        
        // Limpiar entrada
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
        this.state = 'PASO1_CREAR_IGUAL';
        this.simboloParaEscribir = '';
        
        this.logStep(`Cinta inicial: [${this.tape.join(', ')}]`);
        return true;
    }

    executeStep() {
        this.stepCount++;
        
        if (this.stepCount > this.maxSteps) {
            this.logStep(`⚠️ Límite alcanzado. Terminando.`);
            this.state = 'COMPLETO';
            return false;
        }
        
        let symbol = this.getCurrentSymbol();
        
        switch (this.state) {
            // PASO 1: #00+01# → #00+01=#
            case 'PASO1_CREAR_IGUAL':
                if (symbol === '#' && this.head > 0) {
                    this.writeSymbol('=');
                    this.moveRight();
                    this.writeSymbol('#');
                    this.head = 0;
                    this.state = 'PASO2_BUSCAR_ULTIMO_SEGUNDO';
                    this.logStep('✅ Paso 1 completado: Creado = al final');
                } else {
                    this.moveRight();
                }
                break;

            // PASO 2: Encontrar último dígito del segundo número (después de +, antes de =)
            case 'PASO2_BUSCAR_ULTIMO_SEGUNDO':
                if (symbol === '=') {
                    this.moveLeft();
                    this.state = 'PASO3_MARCAR_SEGUNDO';
                    this.logStep('✅ Paso 2: Posicionado en último dígito del segundo número');
                } else {
                    this.moveRight();
                }
                break;

            // PASO 3: #00+01=# → #00+0X=# (marcar último dígito del segundo número)
            case 'PASO3_MARCAR_SEGUNDO':
                if (symbol === '0' || symbol === '1') {
                    this.simboloParaEscribir = symbol;
                    this.writeSymbol('X');
                    this.moveRight();
                    this.state = 'PASO4_ESCRIBIR_SEGUNDO';
                    this.logStep(`✅ Paso 3: Marcado ${symbol} como X`);
                } else if (symbol === 'X') {
                    this.moveLeft();
                } else if (symbol === '+') {
                    // Terminamos segundo número, verificar si agregar +
                    this.moveRight();
                    this.state = 'PASO7_VERIFICAR_SOLO_X';
                    this.logStep('✅ Segundo número terminado, verificando...');
                } else {
                    this.moveLeft();
                }
                break;

            // PASO 4: #00+0X=# → #00+0X=1# (escribir después del =)
            case 'PASO4_ESCRIBIR_SEGUNDO':
                if (symbol === '=') {
                    this.moveRight();
                } else if (symbol === '#') {
                    this.writeSymbol(this.simboloParaEscribir);
                    this.moveRight();
                    this.writeSymbol('#');
                    this.moveLeft();
                    this.moveLeft();
                    this.state = 'PASO5_REGRESAR_SEGUNDO';
                    this.logStep(`✅ Paso 4: Escrito ${this.simboloParaEscribir} después del =`);
                } else if (symbol === '0' || symbol === '1') {
                    this.moveRight();
                } else {
                    this.writeSymbol(this.simboloParaEscribir);
                    this.moveLeft();
                    this.moveLeft();
                    this.state = 'PASO5_REGRESAR_SEGUNDO';
                    this.logStep(`✅ Paso 4: Escrito ${this.simboloParaEscribir}`);
                }
                break;

            // PASO 5: Regresar para continuar con segundo número
            case 'PASO5_REGRESAR_SEGUNDO':
                if (symbol === '=') {
                    this.moveLeft();
                    this.state = 'PASO6_CONTINUAR_SEGUNDO';
                } else {
                    this.moveLeft();
                }
                break;

            case 'PASO6_CONTINUAR_SEGUNDO':
                if (symbol === 'X') {
                    this.moveLeft();
                    this.state = 'PASO3_MARCAR_SEGUNDO';
                    this.logStep('✅ Continuando con segundo número...');
                } else {
                    this.moveLeft();
                }
                break;

            // PASO 7: Verificar si solo hay X entre + y =
            case 'PASO7_VERIFICAR_SOLO_X':
                if (symbol === '=') {
                    // Solo hay X, agregar + al final
                    this.moveRight();
                    this.state = 'PASO8_AGREGAR_PLUS';
                    this.logStep('✅ Solo hay X entre + y =, agregando + al final');
                } else if (symbol === '0' || symbol === '1') {
                    this.moveLeft();
                    this.state = 'PASO3_MARCAR_SEGUNDO';
                    this.logStep('Aún hay dígitos, continuando...');
                } else {
                    this.moveRight();
                }
                break;

            // PASO 8: #00+XX=10# → #00+XX=10+#
            case 'PASO8_AGREGAR_PLUS':
                if (symbol === '#') {
                    this.writeSymbol('+');
                    this.moveRight();
                    this.writeSymbol('#');
                    this.head = 0;
                    this.state = 'PASO9_BUSCAR_ULTIMO_PRIMER';
                    this.logStep('✅ Paso 8: Agregado + al final');
                } else {
                    this.moveRight();
                }
                break;

            // PASO 9: Buscar último dígito del primer número (antes de +)
            case 'PASO9_BUSCAR_ULTIMO_PRIMER':
                if (symbol === '+') {
                    this.moveLeft();
                    this.state = 'PASO10_MARCAR_PRIMER';
                    this.logStep('✅ Paso 9: Posicionado en último dígito del primer número');
                } else {
                    this.moveRight();
                }
                break;

            // PASO 10: Marcar dígito del primer número
            case 'PASO10_MARCAR_PRIMER':
                if (symbol === '0' || symbol === '1') {
                    this.simboloParaEscribir = symbol;
                    this.writeSymbol('Y');
                    this.moveRight();
                    this.state = 'PASO11_BUSCAR_SEGUNDO_PLUS';
                    this.logStep(`✅ Paso 10: Marcado ${symbol} como Y`);
                } else if (symbol === 'Y') {
                    this.moveLeft();
                } else if (symbol === '#') {
                    // Terminamos primer número
                    this.head = 0;
                    this.state = 'PASO13_LIMPIAR';
                    this.logStep('✅ Primer número terminado, limpiando...');
                } else {
                    this.moveLeft();
                }
                break;

            // PASO 11: Buscar segundo + para escribir
            case 'PASO11_BUSCAR_SEGUNDO_PLUS':
                if (symbol === '+' && this.head > 10) {
                    this.moveRight();
                    this.state = 'PASO12_ESCRIBIR_PRIMER';
                    this.logStep('✅ Paso 11: Encontrado segundo +');
                } else {
                    this.moveRight();
                }
                break;

            // PASO 12: Escribir dígito del primer número
            case 'PASO12_ESCRIBIR_PRIMER':
                if (symbol === '#') {
                    this.writeSymbol(this.simboloParaEscribir);
                    this.moveRight();
                    this.writeSymbol('#');
                    this.head = 0;
                    this.state = 'PASO9_BUSCAR_ULTIMO_PRIMER';
                    this.logStep(`✅ Paso 12: Escrito ${this.simboloParaEscribir}`);
                } else if (symbol === '0' || symbol === '1') {
                    this.moveRight();
                } else {
                    this.writeSymbol(this.simboloParaEscribir);
                    this.head = 0;
                    this.state = 'PASO9_BUSCAR_ULTIMO_PRIMER';
                    this.logStep(`✅ Paso 12: Escrito ${this.simboloParaEscribir}`);
                }
                break;

            // PASO 13: Limpiar todo antes del =
            case 'PASO13_LIMPIAR':
                if (symbol === '=') {
                    this.writeSymbol('#');
                    this.moveRight();
                    this.state = 'PASO14_EXTRAER';
                    this.logStep('✅ Paso 13: Limpieza completada');
                } else if (symbol === '#') {
                    this.moveRight();
                } else {
                    this.writeSymbol('#');
                    this.moveRight();
                }
                break;

            // PASO 14: Extraer resultado final
            case 'PASO14_EXTRAER':
                this.extraerResultadoFinal();
                this.state = 'COMPLETO';
                break;

            case 'COMPLETO':
                this.logStep('🎉 ¡INVERSIÓN COMPLETA!');
                return false;
        }
        
        return true;
    }

    extraerResultadoFinal() {
        let primer = '';
        let segundo = '';
        let despuesPlus = false;
        
        for (let i = 1; i < this.tape.length - 1; i++) {
            if (this.tape[i] === '+') {
                despuesPlus = true;
            } else if (this.tape[i] === '0' || this.tape[i] === '1') {
                if (despuesPlus) {
                    segundo += this.tape[i];
                } else {
                    primer += this.tape[i];
                }
            }
        }
        
        this.tape = ['#'];
        for (let char of primer) {
            this.tape.push(char);
        }
        this.tape.push('+');
        for (let char of segundo) {
            this.tape.push(char);
        }
        this.tape.push('#');
        
        this.head = 1;
        this.logStep(`🎯 RESULTADO FINAL: ${primer}+${segundo}`);
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