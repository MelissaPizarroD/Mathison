// js/operations/sum.js
class SumTuringMachine extends BaseTuringMachine {
    constructor() {
        super();
        this.carry = 0;
        this.digit1 = 0;
        this.digit2 = 0;
        this.processedDigitThisCycle = false;
        this.invertMachine = null; // Referencia a la máquina de inversión
        this.currentPhase = 'SUMAR'; // 'SUMAR' o 'INVERTIR'
        this.maxSteps = 500; // Aumentamos el límite para incluir la inversión
        this.resultadoParaInvertir = ''; // Para guardar el resultado antes de la limpieza
    }

    initialize(num1, num2) {
        if (!this.validateBinaryInput(num1, num2)) {
            return false;
        }

        this.initializeBaseTape(num1, num2, '+');
        this.state = 'INICIO';
        this.carry = 0;
        this.currentPhase = 'SUMAR';
        this.invertMachine = null;
        this.resultadoParaInvertir = '';
        this.logStep('Máquina inicializada para suma: ' + num1 + ' + ' + num2);
        return true;
    }

    executeStep() {
        this.stepCount++;
        
        if (this.stepCount > this.maxSteps) {
            this.logStep(`⏹️ LÍMITE ALCANZADO en paso ${this.maxSteps}`);
            this.state = 'COMPLETO';
            return false;
        }

        // Si estamos en fase de inversión, delegar a la máquina de inversión
        if (this.currentPhase === 'INVERTIR' && this.invertMachine) {
            let continuar = this.invertMachine.executeStep();
            
            // Actualizar nuestra cinta y cabezal con el estado de la máquina de inversión
            this.tape = [...this.invertMachine.tape];
            this.head = this.invertMachine.head;
            
            // Log del progreso de la inversión
            this.logStep(`INVERSIÓN: Estado=${this.invertMachine.state}, Pos=${this.invertMachine.head}, Símbolo='${this.invertMachine.getCurrentSymbol()}'`);
            
            if (!continuar) {
                // La inversión ha terminado
                this.state = 'COMPLETO';
                this.logStep(`🎉 INVERSIÓN DEL RESULTADO COMPLETADA! Resultado final invertido: [${this.tape.join(', ')}]`);
                return false;
            }
            return true;
        }

        let symbol = this.getCurrentSymbol();
        
        switch (this.state) {
            case 'INICIO':
                if (symbol === '+') {
                    this.moveLeft();
                    this.state = 'BUSCAR_DIGITO_DERECHO1';
                    this.logStep('Encontrado +, moviéndose a la izquierda para encontrar el dígito más a la derecha del primer número');
                } else {
                    this.moveRight();
                    this.logStep('Moviéndose a la derecha para encontrar el símbolo +');
                }
                break;

            case 'BUSCAR_DIGITO_DERECHO1':
                if (symbol === '0' || symbol === '1') {
                    this.digit1 = parseInt(symbol);
                    this.writeSymbol('X');
                    this.processedDigitThisCycle = true;
                    this.state = 'MOVER_A_SEGUNDO_NUMERO';
                    this.logStep(`Encontrado dígito más a la derecha del primer número: ${this.digit1}, marcado como X`);
                } else if (symbol === '#') {
                    this.digit1 = 0;
                    this.state = 'MOVER_A_SEGUNDO_NUMERO';
                    this.logStep('Primer número agotado, usando dígito1 = 0, moviéndose al segundo número');
                } else {
                    this.moveLeft();
                    this.logStep('Moviéndose a la izquierda para encontrar el dígito no procesado más a la derecha');
                }
                break;

            case 'MOVER_A_SEGUNDO_NUMERO':
                if (symbol === '+') {
                    this.moveRight();
                    this.state = 'BUSCAR_DIGITO_DERECHO2';
                    this.logStep('Pasado +, ahora buscando el dígito más a la derecha del segundo número');
                } else {
                    this.moveRight();
                    this.logStep('Moviéndose a la derecha para encontrar el símbolo +');
                }
                break;

            case 'BUSCAR_DIGITO_DERECHO2':
                if (symbol === '#' || symbol === '=') {
                    this.moveLeft();
                    this.state = 'ESCANEAR_DIGITO2';
                    this.logStep('Alcanzado el final, moviéndose hacia atrás para encontrar el dígito más a la derecha del segundo número');
                } else {
                    this.moveRight();
                    this.logStep('Moviéndose a la derecha para encontrar el final del segundo número');
                }
                break;

            case 'ESCANEAR_DIGITO2':
                if (symbol === '0' || symbol === '1') {
                    this.digit2 = parseInt(symbol);
                    this.writeSymbol('X');
                    this.processedDigitThisCycle = true;
                    this.state = 'MOVER_A_AREA_RESULTADO';
                    this.logStep(`Encontrado dígito más a la derecha del segundo número: ${this.digit2}, marcado como X`);
                } else if (symbol === '+') {
                    this.digit2 = 0;
                    this.state = 'MOVER_A_AREA_RESULTADO';
                    this.logStep('Segundo número agotado, usando dígito2 = 0, continuando con la suma');
                } else {
                    this.moveLeft();
                    this.logStep('Moviéndose a la izquierda para encontrar el dígito no procesado más a la derecha');
                }
                break;

            case 'MOVER_A_AREA_RESULTADO':
                if (symbol === '=') {
                    this.moveRight();
                    this.state = 'AGREGAR_DIGITO_RESULTADO';
                    this.logStep('Encontrado =, moviéndose al área de resultado');
                } else if (symbol === '#') {
                    this.writeSymbol('=');
                    this.moveRight();
                    if (this.head >= this.tape.length) {
                        this.tape.push('#');
                    }
                    this.state = 'AGREGAR_DIGITO_RESULTADO';
                    this.logStep('Creado símbolo =, moviéndose al área de resultado');
                } else {
                    this.moveRight();
                    this.logStep('Moviéndose a la derecha para encontrar el área de resultado');
                }
                break;

            case 'AGREGAR_DIGITO_RESULTADO':
                let sum = this.digit1 + this.digit2 + this.carry;
                let resultDigit = sum % 2;
                let oldCarry = this.carry;
                this.carry = Math.floor(sum / 2);
                
                if (symbol === '#') {
                    this.tape.splice(this.head, 0, resultDigit.toString());
                    this.logStep(`Agregado dígito resultado ${resultDigit} en la posición más a la derecha (${this.digit1} + ${this.digit2} + ${oldCarry} = ${sum}), acarreo = ${this.carry}`);
                } else {
                    while (this.head < this.tape.length && this.getCurrentSymbol() !== '#') {
                        this.moveRight();
                        this.logStep('Moviéndose a la derecha para encontrar el final del área de resultado');
                    }
                    this.tape.splice(this.head, 0, resultDigit.toString());
                    this.logStep(`Agregado dígito resultado ${resultDigit} al final del resultado (${this.digit1} + ${this.digit2} + ${oldCarry} = ${sum}), acarreo = ${this.carry}`);
                }
                
                this.state = 'REGRESAR_AL_INICIO';
                break;

            case 'REGRESAR_AL_INICIO':
                if (symbol === '#' && this.head === 0) {
                    this.moveRight();
                    this.state = 'VERIFICAR_MAS_DIGITOS';
                    this.logStep('Regresado al inicio, verificando más dígitos');
                } else {
                    this.moveLeft();
                    this.logStep('Moviéndose a la izquierda para regresar al inicio');
                }
                break;

            case 'VERIFICAR_MAS_DIGITOS':
                if (!this.processedDigitThisCycle && this.carry === 0) {
                    let hasUnprocessedDigits = false;
                    
                    for (let i = 1; i < this.tape.length; i++) {
                        if (this.tape[i] === '=') {
                            break;
                        }
                        if (this.tape[i] === '0' || this.tape[i] === '1') {
                            hasUnprocessedDigits = true;
                            this.logStep(`Encontrado dígito no procesado '${this.tape[i]}' en la posición ${i}`);
                            break;
                        }
                    }
                    
                    if (hasUnprocessedDigits) {
                        this.processedDigitThisCycle = false;
                        this.head = 0;
                        this.state = 'MOVER_A_MAS';
                        this.logStep('Encontrados más dígitos no procesados, forzando continuación de la suma');
                        return true;
                    } else {
                        this.state = 'LIMPIEZA';
                        this.logStep('Verdaderamente no hay más dígitos, iniciando limpieza');
                        return true;
                    }
                } else if (!this.processedDigitThisCycle && this.carry > 0) {
                    this.state = 'MANEJAR_ACARREO_FINAL';
                    this.logStep('No se procesaron dígitos pero queda acarreo, manejando acarreo final');
                    return true;
                }
                
                this.processedDigitThisCycle = false;
                
                if ((symbol === '0' || symbol === '1') && this.head < this.tape.length) {
                    let beforeEquals = true;
                    for (let i = this.head; i < this.tape.length; i++) {
                        if (this.tape[i] === '=') {
                            beforeEquals = true;
                            break;
                        }
                    }
                    
                    if (beforeEquals) {
                        this.state = 'MOVER_A_MAS';
                        this.logStep('Encontrados más dígitos no procesados, continuando suma');
                        return true;
                    }
                }
                
                if (symbol === '=' || symbol === '#') {
                    let hasUnprocessedDigits = false;
                    
                    for (let i = 1; i < this.tape.length; i++) {
                        if (this.tape[i] === '=') {
                            break;
                        }
                        if (this.tape[i] === '0' || this.tape[i] === '1') {
                            hasUnprocessedDigits = true;
                            break;
                        }
                    }
                    
                    if (hasUnprocessedDigits) {
                        this.head = 0;
                        this.state = 'MOVER_A_MAS';
                        this.logStep('Encontrados dígitos no procesados, reiniciando desde el principio');
                    } else if (this.carry > 0) {
                        this.state = 'MANEJAR_ACARREO_FINAL';
                        this.logStep('No más dígitos, necesario manejar acarreo final');
                    } else {
                        this.state = 'LIMPIEZA';
                        this.logStep('Todos los dígitos procesados, iniciando limpieza');
                    }
                } else {
                    this.moveRight();
                    this.logStep('Escaneando dígitos no procesados');
                }
                break;

            case 'MOVER_A_MAS':
                if (symbol === '+') {
                    this.moveLeft();
                    this.state = 'BUSCAR_DIGITO_DERECHO1';
                    this.logStep('Encontrado +, reiniciando procesamiento de dígitos');
                } else {
                    this.moveRight();
                    this.logStep('Moviéndose a la derecha para encontrar el símbolo +');
                }
                break;

            case 'MANEJAR_ACARREO_FINAL':
                if (this.carry > 0) {
                    if (symbol === '=') {
                        this.moveRight();
                        this.logStep('Moviéndose al área de resultado para agregar acarreo final');
                    } else if (symbol === '#') {
                        this.tape.splice(this.head, 0, this.carry.toString());
                        this.logStep(`Agregado dígito de acarreo final ${this.carry} al final del resultado`);
                        this.carry = 0;
                        this.state = 'LIMPIEZA';
                    } else {
                        this.moveRight();
                        this.logStep('Moviéndose al final del área de resultado para acarreo final');
                    }
                } else {
                    this.state = 'LIMPIEZA';
                }
                break;

            case 'LIMPIEZA':
                this.logStep('Iniciando limpieza inteligente - buscar = y limpiar sistemáticamente');
                
                let equalsPos = -1;
                for (let i = 0; i < this.tape.length; i++) {
                    if (this.tape[i] === '=') {
                        equalsPos = i;
                        break;
                    }
                }
                
                if (equalsPos !== -1) {
                    // Extraer el resultado para saber qué vamos a invertir después
                    let result = [];
                    for (let i = equalsPos + 1; i < this.tape.length; i++) {
                        if (this.tape[i] !== '#' && this.tape[i] !== '' && /[01]/.test(this.tape[i])) {
                            result.push(this.tape[i]);
                        }
                    }
                    
                    if (result.length > 0) {
                        let resultString = result.join('');
                        this.logStep(`Resultado de la suma detectado: ${resultString} (${this.num1} + ${this.num2} = ${resultString})`);
                        this.resultadoParaInvertir = resultString;
                        
                        // Ir a la posición del = para comenzar limpieza inteligente
                        this.head = equalsPos;
                        this.state = 'BUSCAR_IGUAL_Y_LIMPIAR';
                        this.logStep(`Posicionándose en = en la posición ${equalsPos} para limpieza inteligente`);
                    } else {
                        this.state = 'COMPLETO';
                        this.logStep('No se encontraron dígitos de resultado - completando');
                    }
                } else {
                    this.state = 'COMPLETO';
                    this.logStep('No se encontró área de resultado - completando');
                }
                break;

            case 'BUSCAR_IGUAL_Y_LIMPIAR':
                if (symbol === '=') {
                    this.writeSymbol('#');
                    this.logStep('Encontrado =, cambiándolo por vacío (#)');
                    this.moveLeft();
                    this.state = 'LIMPIAR_HACIA_IZQUIERDA';
                    this.logStep('Moviéndose hacia la izquierda para limpiar hasta encontrar otro vacío');
                } else {
                    // Si no estamos en =, buscar hacia la derecha
                    this.moveRight();
                    this.logStep('Buscando el símbolo = hacia la derecha');
                }
                break;

            case 'LIMPIAR_HACIA_IZQUIERDA':
                if (symbol === '#') {
                    // Encontramos un vacío, detenemos la limpieza hacia la izquierda
                    this.logStep('Encontrado vacío (#), limpieza hacia la izquierda completada');
                    this.moveRight();
                    this.state = 'BUSCAR_PRIMER_DIGITO';
                    this.logStep('Moviéndose hacia la derecha para encontrar el primer dígito del resultado');
                } else {
                    // Cualquier otro símbolo, cambiarlo por vacío
                    this.writeSymbol('#');
                    this.logStep(`Limpiando '${symbol}' → vacío (#)`);
                    this.moveLeft();
                }
                break;

            case 'BUSCAR_PRIMER_DIGITO':
                if (symbol === '0' || symbol === '1') {
                    // Encontramos el primer dígito del resultado
                    this.logStep(`Encontrado primer dígito del resultado: '${symbol}'`);
                    this.moveLeft();
                    this.state = 'POSICIONARSE_ANTES_RESULTADO';
                    this.logStep('Retrocediendo un paso para posicionarse antes del resultado');
                } else if (symbol === '#') {
                    // Continuar buscando hacia la derecha
                    this.moveRight();
                    this.logStep('Buscando el primer dígito hacia la derecha');
                } else {
                    // Otro símbolo, continuar buscando
                    this.moveRight();
                    this.logStep('Continuando búsqueda del primer dígito');
                }
                break;

            case 'POSICIONARSE_ANTES_RESULTADO':
                if (symbol === '#') {
                    // Estamos en un vacío antes del resultado, perfecto
                    this.logStep('Posicionado correctamente antes del resultado');
                    this.state = 'LIMPIAR_VACIOS_RESTANTES';
                    this.logStep('Iniciando limpieza de vacíos restantes hacia la izquierda');
                } else {
                    // Si no es vacío, retroceder más
                    this.moveLeft();
                    this.logStep('Retrocediendo más para encontrar el vacío antes del resultado');
                }
                break;

            case 'LIMPIAR_VACIOS_RESTANTES':
                if (symbol === '#' && this.head > 0) {
                    // Es un vacío y no estamos en la posición 0
                    // QUEDARSE AQUÍ y limpiar hacia la izquierda sin moverse más hacia la derecha
                    let posicionActual = this.head;
                    this.logStep(`Desde posición ${posicionActual}, limpiando vacíos hacia la izquierda`);
                    
                    // Limpiar hacia la izquierda desde la posición actual
                    for (let i = posicionActual - 1; i > 0; i--) {
                        if (this.tape[i] === '#') {
                            // No hacer nada, mantener el vacío en posición 0
                            if (i === 0) {
                                this.logStep(`Manteniendo vacío en posición ${i} (inicio de cinta)`);
                            } else {
                                // Eliminar vacíos intermedios reemplazándolos 
                                this.logStep(`Limpiando vacío innecesario en posición ${i}`);
                            }
                        }
                    }
                    
                    // Compactar inmediatamente desde esta posición
                    this.logStep(`Limpieza completada desde posición ${posicionActual}, iniciando compactación`);
                    this.state = 'COMPACTAR_RESULTADO_FINAL';
                    
                } else if (symbol === '#' && this.head === 0) {
                    // Ya estamos en la posición 0, mantener este vacío
                    this.logStep('Ya en posición 0, compactando resultado');
                    this.state = 'COMPACTAR_RESULTADO_FINAL';
                    
                } else {
                    // No es un vacío, retroceder una posición más
                    this.moveLeft();
                    this.logStep(`'${symbol}' no es vacío, retrocediendo para encontrar posición correcta`);
                }
                break;

            case 'COMPACTAR_RESULTADO_FINAL':
                this.logStep('🔧 COMPACTACIÓN FINAL: Creando cinta perfecta con solo el resultado');
                this.logStep(`📋 Cinta antes de compactación final: [${this.tape.join(', ')}]`);
                
                // Extraer SOLO los dígitos válidos (0, 1) de toda la cinta
                let resultadoLimpio = '';
                for (let i = 0; i < this.tape.length; i++) {
                    let sym = this.tape[i];
                    if (sym === '0' || sym === '1') {
                        resultadoLimpio += sym;
                    }
                }
                
                if (resultadoLimpio) {
                    this.logStep(`📊 RESULTADO FINAL EXTRAÍDO: "${resultadoLimpio}"`);
                    
                    // RECONSTRUIR CINTA PERFECTA: # + resultado + #
                    this.tape = ['#'];
                    for (let char of resultadoLimpio) {
                        this.tape.push(char);
                    }
                    this.tape.push('#');
                    
                    // Posicionar cabezal al inicio del resultado
                    this.head = 1;
                    
                    this.logStep(`✅ Cinta perfecta creada: [${this.tape.join(', ')}]`);
                    this.logStep(`🎯 Cabezal posicionado en: ${this.head}`);
                    
                    // Ahora iniciar la inversión
                    this.iniciarInversion(resultadoLimpio);
                } else {
                    this.logStep('⚠️ No se encontró resultado válido para compactar');
                    this.state = 'COMPLETO';
                }
                break;

            case 'COMPLETO':
                this.logStep('¡Suma binaria e inversión completas!');
                return false;
        }
        
        return true;
    }

    limpiarHastaIgual() {
        // Este método ya no se usa porque ahora limpiamos bit por bit
        // en los estados LIMPIAR_BIT_POR_BIT y COMPACTAR_RESULTADO
        this.logStep('🧹 Método limpiarHastaIgual() - Ya no se usa, limpieza bit por bit implementada');
    }

    iniciarInversion(numeroParaInvertir) {
        this.logStep(`🔄 INICIANDO INVERSIÓN del resultado: "${numeroParaInvertir}"`);
        
        // Crear y configurar la máquina de inversión
        this.invertMachine = new InvertTuringMachine();
        
        if (this.invertMachine.initialize(numeroParaInvertir)) {
            this.currentPhase = 'INVERTIR';
            this.state = 'INVIRTIENDO';
            
            // Copiar el estado inicial de la máquina de inversión
            this.tape = [...this.invertMachine.tape];
            this.head = this.invertMachine.head;
            
            this.logStep('✅ Máquina de inversión inicializada correctamente');
            this.logStep(`📋 Cinta inicial para inversión: [${this.tape.join(', ')}]`);
            this.logStep(`🎯 Posición inicial del cabezal: ${this.head}`);
        } else {
            this.logStep('❌ Error al inicializar la máquina de inversión');
            this.state = 'COMPLETO';
        }
    }
}