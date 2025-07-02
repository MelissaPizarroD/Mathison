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
                    this.moveLeft(); // Comenzar a regresar paso a paso
                    this.state = 'REGRESAR_DESDE_FINAL';
                    this.logStep('✅ Paso 1: Creado = al final, regresando paso a paso');
                } else {
                    this.moveRight();
                }
                break;

            // Regresar paso a paso desde el final hasta encontrar el =
            case 'REGRESAR_DESDE_FINAL':
                if (symbol === '=') {
                    this.moveLeft(); // Posicionarse en el último dígito del segundo número
                    this.state = 'PASO3_MARCAR_SEGUNDO';
                    this.logStep('✅ Encontrado =, posicionado en último dígito del segundo número');
                } else {
                    this.moveLeft();
                    this.logStep('Regresando paso a paso...');
                }
                break;

            // PASO 3: #00+01=# → #00+0X=# (marcar último dígito del segundo número)
            case 'PASO3_MARCAR_SEGUNDO':
                if (symbol === '0' || symbol === '1') {
                    this.simboloParaEscribir = symbol;
                    this.writeSymbol('X');
                    this.moveRight(); // Ir hacia el =
                    this.state = 'IR_A_IGUAL_PARA_ESCRIBIR';
                    this.logStep(`✅ Paso 3: Marcado ${symbol} como X, yendo al =`);
                } else if (symbol === 'X') {
                    this.moveLeft();
                    this.logStep('Dígito ya procesado, continuando hacia la izquierda');
                } else if (symbol === '+') {
                    // Terminamos segundo número, verificar si solo hay X
                    this.moveRight(); // Ir hacia el área entre + y =
                    this.state = 'VERIFICAR_SOLO_X_SEGUNDO';
                    this.logStep('✅ Segundo número terminado, verificando si solo hay X');
                } else {
                    this.moveLeft();
                    this.logStep('Continuando hacia la izquierda en segundo número');
                }
                break;

            case 'IR_A_IGUAL_PARA_ESCRIBIR':
                if (symbol === '=') {
                    this.moveRight(); // Pasar el = para escribir
                    this.state = 'ESCRIBIR_SEGUNDO_RESULTADO';
                    this.logStep('Pasando el = para escribir resultado');
                } else {
                    this.moveRight();
                    this.logStep('Buscando el = para escribir');
                }
                break;

            // PASO 4: #00+0X=# → #00+0X=1# (escribir después del =)
            case 'ESCRIBIR_SEGUNDO_RESULTADO':
                if (symbol === '#') {
                    this.writeSymbol(this.simboloParaEscribir);
                    this.moveRight();
                    this.writeSymbol('#');
                    this.moveLeft(); // Comenzar regreso
                    this.moveLeft(); // Continuar regreso
                    this.state = 'REGRESAR_AL_IGUAL';
                    this.logStep(`✅ Paso 4: Escrito ${this.simboloParaEscribir}, regresando al =`);
                } else if (symbol === '0' || symbol === '1') {
                    this.moveRight();
                    this.logStep('Posición ocupada, buscando siguiente');
                } else {
                    this.writeSymbol(this.simboloParaEscribir);
                    this.moveLeft(); // Comenzar regreso
                    this.state = 'REGRESAR_AL_IGUAL';
                    this.logStep(`✅ Escrito ${this.simboloParaEscribir}, regresando al =`);
                }
                break;

            case 'REGRESAR_AL_IGUAL':
                if (symbol === '=') {
                    this.moveLeft(); // Ir al último dígito procesado
                    this.state = 'BUSCAR_X_PROCESADO';
                    this.logStep('Regresado al =, buscando X procesado');
                } else {
                    this.moveLeft();
                    this.logStep('Regresando hacia el =...');
                }
                break;

            case 'BUSCAR_X_PROCESADO':
                if (symbol === 'X') {
                    this.moveLeft(); // Continuar hacia el siguiente dígito
                    this.state = 'PASO3_MARCAR_SEGUNDO';
                    this.logStep('Encontrado X, continuando con siguiente dígito del segundo número');
                } else {
                    this.moveLeft();
                    this.logStep('Buscando X del dígito procesado');
                }
                break;

            // Verificar si solo hay X entre + y =
            case 'VERIFICAR_SOLO_X_SEGUNDO':
                if (symbol === '=') {
                    // Solo hay X, ir al final para agregar +
                    this.moveRight();
                    this.state = 'IR_AL_FINAL_PARA_PLUS';
                    this.logStep('✅ Solo hay X entre + y =, yendo al final para agregar +');
                } else if (symbol === '0' || symbol === '1') {
                    // Aún hay dígitos, regresar
                    this.moveLeft();
                    this.state = 'REGRESAR_A_PLUS';
                    this.logStep('Aún hay dígitos, regresando al +');
                } else if (symbol === 'X') {
                    this.moveRight();
                    this.logStep('Verificando X...');
                } else {
                    this.moveRight();
                    this.logStep('Verificando área entre + y =');
                }
                break;

            case 'REGRESAR_A_PLUS':
                if (symbol === '+') {
                    this.moveRight(); // Ir al área del segundo número
                    this.state = 'BUSCAR_ULTIMO_DIGITO_SEGUNDO';
                    this.logStep('Regresado al +, buscando último dígito no procesado');
                } else {
                    this.moveLeft();
                    this.logStep('Regresando al +...');
                }
                break;

            case 'BUSCAR_ULTIMO_DIGITO_SEGUNDO':
                if (symbol === '=') {
                    this.moveLeft();
                    this.state = 'PASO3_MARCAR_SEGUNDO';
                    this.logStep('Encontrado =, procesando último dígito del segundo número');
                } else if (symbol === '0' || symbol === '1') {
                    // Ir al final de este número para procesarlo desde la derecha
                    this.moveRight();
                    this.logStep('Buscando final del segundo número...');
                } else {
                    this.moveRight();
                    this.logStep('Navegando en segundo número...');
                }
                break;

            case 'IR_AL_FINAL_PARA_PLUS':
                if (symbol === '#') {
                    this.writeSymbol('+');
                    this.moveRight();
                    this.writeSymbol('#');
                    this.moveLeft(); // Comenzar regreso para primer número
                    this.state = 'REGRESAR_PARA_PRIMER_NUMERO';
                    this.logStep('✅ Agregado +, regresando para procesar primer número');
                } else {
                    this.moveRight();
                    this.logStep('Yendo al final para agregar +...');
                }
                break;

            case 'REGRESAR_PARA_PRIMER_NUMERO':
                if (symbol === '+' && this.head < 10) { // El + original
                    this.moveLeft(); // Ir al último dígito del primer número
                    this.state = 'MARCAR_PRIMER_NUMERO';
                    this.logStep('✅ Encontrado + original, procesando primer número');
                } else {
                    this.moveLeft();
                    this.logStep('Regresando para encontrar primer número...');
                }
                break;

            case 'MARCAR_PRIMER_NUMERO':
                if (symbol === '0' || symbol === '1') {
                    this.simboloParaEscribir = symbol;
                    this.writeSymbol('Y');
                    this.moveRight(); // Ir hacia el área de resultados
                    this.state = 'BUSCAR_SEGUNDO_PLUS';
                    this.logStep(`✅ Marcado ${symbol} como Y en primer número`);
                } else if (symbol === 'Y') {
                    this.moveLeft();
                    this.logStep('Dígito ya procesado en primer número, continuando hacia la izquierda');
                } else if (symbol === '#') {
                    // Llegamos al inicio, verificar si hay más dígitos
                    this.moveRight();
                    this.state = 'VERIFICAR_PRIMER_COMPLETO';
                    this.logStep('✅ Llegamos al inicio, verificando si primer número está completo');
                } else {
                    this.moveLeft();
                    this.logStep('Continuando hacia la izquierda en primer número...');
                }
                break;

            case 'BUSCAR_SEGUNDO_PLUS':
                if (symbol === '+' && this.head > 15) { // El segundo +
                    this.moveRight();
                    this.state = 'ESCRIBIR_PRIMER_RESULTADO';
                    this.logStep('✅ Encontrado segundo +, escribiendo resultado del primer número');
                } else {
                    this.moveRight();
                    this.logStep('Buscando segundo + para escribir...');
                }
                break;

            case 'ESCRIBIR_PRIMER_RESULTADO':
                if (symbol === '#') {
                    this.writeSymbol(this.simboloParaEscribir);
                    this.moveRight();
                    this.writeSymbol('#');
                    this.moveLeft();
                    this.state = 'REGRESAR_PARA_CONTINUAR_PRIMER';
                    this.logStep(`✅ Escrito ${this.simboloParaEscribir}, regresando para continuar`);
                } else if (symbol === '0' || symbol === '1') {
                    this.moveRight();
                    this.logStep('Posición ocupada, buscando siguiente');
                } else {
                    this.writeSymbol(this.simboloParaEscribir);
                    this.state = 'REGRESAR_PARA_CONTINUAR_PRIMER';
                    this.logStep(`✅ Escrito ${this.simboloParaEscribir}, regresando`);
                }
                break;

            case 'REGRESAR_PARA_CONTINUAR_PRIMER':
                if (symbol === '+' && this.head < 10) { // + original
                    this.moveLeft();
                    this.state = 'BUSCAR_SIGUIENTE_DIGITO_PRIMER';
                    this.logStep('Regresado al + original, buscando siguiente dígito del primer número');
                } else {
                    this.moveLeft();
                    this.logStep('Regresando al + original...');
                }
                break;

            case 'BUSCAR_SIGUIENTE_DIGITO_PRIMER':
                if (symbol === '0' || symbol === '1') {
                    // Encontramos un dígito sin marcar del primer número
                    this.simboloParaEscribir = symbol;
                    this.writeSymbol('Y');
                    this.moveRight(); // Ir hacia el área de resultados
                    this.state = 'BUSCAR_SEGUNDO_PLUS';
                    this.logStep(`✅ Encontrado dígito ${symbol} sin marcar, marcado como Y`);
                } else if (symbol === 'Y') {
                    // Ya procesado, continuar hacia la izquierda
                    this.moveLeft();
                    this.logStep('Dígito ya procesado, continuando hacia la izquierda');
                } else if (symbol === '#') {
                    // Llegamos al inicio, primer número completado
                    this.moveRight();
                    this.state = 'VERIFICAR_PRIMER_COMPLETO';
                    this.logStep('✅ Llegamos al inicio, verificando si primer número está completo');
                } else {
                    this.moveLeft();
                    this.logStep('Continuando búsqueda hacia la izquierda...');
                }
                break;

            case 'VERIFICAR_PRIMER_COMPLETO':
                // Verificar si aún hay dígitos 0 o 1 antes del primer +
                let hayMasPrimer = false;
                for (let i = 1; i < this.tape.length; i++) {
                    if (this.tape[i] === '+') break; // Parar en el primer +
                    if (this.tape[i] === '0' || this.tape[i] === '1') {
                        hayMasPrimer = true;
                        break;
                    }
                }
                
                if (hayMasPrimer) {
                    // Aún hay dígitos, buscar desde el + hacia la izquierda
                    this.moveRight();
                    this.state = 'BUSCAR_PLUS_PARA_CONTINUAR';
                    this.logStep('Aún hay dígitos sin procesar en primer número, continuando...');
                } else {
                    // Terminamos, limpiar
                    this.state = 'LIMPIAR_PASO_A_PASO';
                    this.logStep('✅ Primer número completado, iniciando limpieza');
                }
                break;

            case 'BUSCAR_PLUS_PARA_CONTINUAR':
                if (symbol === '+') {
                    this.moveLeft();
                    this.state = 'BUSCAR_SIGUIENTE_DIGITO_PRIMER';
                    this.logStep('Encontrado +, continuando búsqueda de dígitos sin marcar');
                } else {
                    this.moveRight();
                    this.logStep('Buscando + para continuar...');
                }
                break;

            case 'LIMPIAR_PASO_A_PASO':
                if (symbol === '=') {
                    this.writeSymbol('#');
                    this.moveRight();
                    this.state = 'EXTRAER_RESULTADO_FINAL';
                    this.logStep('✅ Limpieza completada, extrayendo resultado');
                } else if (symbol === '#') {
                    this.moveRight();
                    this.logStep('Ya limpio, continuando...');
                } else {
                    this.writeSymbol('#');
                    this.moveRight();
                    this.logStep(`Limpiando ${symbol}...`);
                }
                break;

            case 'EXTRAER_RESULTADO_FINAL':
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