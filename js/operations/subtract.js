// js/operations/subtract.js
class SubtractTuringMachine extends BaseTuringMachine {
    constructor() {
        super();
        this.borrow = 0;
        this.digit1 = 0;
        this.digit2 = 0;
        this.processedDigitThisCycle = false;
        this.isNegative = false;
        this.originalNum1 = '';
        this.originalNum2 = '';
    }

    initialize(num1, num2) {
        if (!this.validateBinaryInput(num1, num2)) {
            return false;
        }

        this.originalNum1 = num1;
        this.originalNum2 = num2;
        
        // Comparar números para determinar si el resultado será negativo
        const val1 = parseInt(num1, 2);
        const val2 = parseInt(num2, 2);
        
        if (val1 < val2) {
            // Intercambiar números para hacer resta positiva y marcar como negativo
            this.isNegative = true;
            this.initializeBaseTape(num2, num1, '-');
            this.logStep(`Máquina inicializada para resta: ${num1} - ${num2} (resultado será negativo, calculando ${num2} - ${num1})`);
        } else {
            this.isNegative = false;
            this.initializeBaseTape(num1, num2, '-');
            this.logStep('Máquina inicializada para resta: ' + num1 + ' - ' + num2);
        }
        
        this.state = 'INICIO';
        this.borrow = 0;
        return true;
    }

    executeStep() {
        this.stepCount++;
        let symbol = this.getCurrentSymbol();
        
        switch (this.state) {
            case 'INICIO':
                if (symbol === '-') {
                    this.moveLeft();
                    this.state = 'BUSCAR_DIGITO_DERECHO1';
                    this.logStep('Encontrado -, moviéndose a la izquierda para encontrar el dígito más a la derecha del primer número');
                } else {
                    this.moveRight();
                    this.logStep('Moviéndose a la derecha para encontrar el símbolo -');
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
                if (symbol === '-') {
                    this.moveRight();
                    this.state = 'BUSCAR_DIGITO_DERECHO2';
                    this.logStep('Pasado -, ahora buscando el dígito más a la derecha del segundo número');
                } else {
                    this.moveRight();
                    this.logStep('Moviéndose a la derecha para encontrar el símbolo -');
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
                } else if (symbol === '-') {
                    this.digit2 = 0;
                    this.state = 'MOVER_A_AREA_RESULTADO';
                    this.logStep('Segundo número agotado, usando dígito2 = 0, continuando con la resta');
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
                let resultDigit;
                let oldBorrow = this.borrow;
                
                // Lógica de resta binaria con préstamo
                if (this.digit1 >= this.digit2 + this.borrow) {
                    resultDigit = this.digit1 - this.digit2 - this.borrow;
                    this.borrow = 0;
                } else {
                    resultDigit = (2 + this.digit1) - this.digit2 - this.borrow;
                    this.borrow = 1;
                }
                
                if (symbol === '#') {
                    this.tape.splice(this.head, 0, resultDigit.toString());
                    this.logStep(`Agregado dígito resultado ${resultDigit} (${this.digit1} - ${this.digit2} - ${oldBorrow} = ${resultDigit}), préstamo = ${this.borrow}`);
                } else {
                    while (this.head < this.tape.length && this.getCurrentSymbol() !== '#') {
                        this.moveRight();
                        this.logStep('Moviéndose a la derecha para encontrar el final del área de resultado');
                    }
                    this.tape.splice(this.head, 0, resultDigit.toString());
                    this.logStep(`Agregado dígito resultado ${resultDigit} al final (${this.digit1} - ${this.digit2} - ${oldBorrow} = ${resultDigit}), préstamo = ${this.borrow}`);
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
                if (!this.processedDigitThisCycle && this.borrow === 0) {
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
                        this.logStep('Encontrados más dígitos no procesados, continuando resta');
                        return true;
                    } else {
                        this.state = 'LIMPIEZA';
                        this.logStep('Todos los dígitos procesados, iniciando limpieza');
                        return true;
                    }
                } else if (!this.processedDigitThisCycle && this.borrow > 0) {
                    this.logStep('Préstamo restante detectado - esto indica un error en el cálculo');
                    this.state = 'LIMPIEZA';
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
                        this.logStep('Encontrados más dígitos no procesados, continuando resta');
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
                if (symbol === '-') {
                    this.moveLeft();
                    this.state = 'BUSCAR_DIGITO_DERECHO1';
                    this.logStep('Encontrado -, reiniciando procesamiento de dígitos');
                } else {
                    this.moveRight();
                    this.logStep('Moviéndose a la derecha para encontrar el símbolo -');
                }
                break;

            case 'LIMPIEZA':
                this.logStep('Iniciando limpieza - extrayendo resultado final');
                
                let equalsPos = -1;
                for (let i = 0; i < this.tape.length; i++) {
                    if (this.tape[i] === '=') {
                        equalsPos = i;
                        break;
                    }
                }
                
                if (equalsPos !== -1) {
                    let result = [];
                    for (let i = equalsPos + 1; i < this.tape.length; i++) {
                        if (this.tape[i] !== '#' && this.tape[i] !== '' && /[01]/.test(this.tape[i])) {
                            result.push(this.tape[i]);
                        }
                    }
                    
                    if (result.length > 0) {
                        result.reverse();
                        
                        // No agregar signo negativo, solo mostrar el número
                        let finalResult = result.join('');
                        let logMessage;
                        
                        if (this.isNegative && finalResult !== '0') {
                            logMessage = `Resultado final: ${finalResult} (${this.originalNum1} - ${this.originalNum2} = -${finalResult} en decimal). ¡Este número es negativo! En este ejercicio académico no se representarán números binarios negativos por complemento a dos.`;
                        } else {
                            logMessage = `Resultado final: ${finalResult} (${this.originalNum1} - ${this.originalNum2} = ${finalResult})`;
                        }
                        
                        this.tape = ['#'];
                        for (let digit of result) {
                            this.tape.push(digit);
                        }
                        this.tape.push('#');
                        this.head = 1;
                        this.state = 'COMPLETO';
                        this.logStep(logMessage);
                    } else {
                        // Resultado es 0
                        this.tape = ['#', '0', '#'];
                        this.head = 1;
                        this.state = 'COMPLETO';
                        this.logStep(`Resultado final: 0 (${this.originalNum1} - ${this.originalNum2} = 0)`);
                    }
                } else {
                    this.state = 'COMPLETO';
                    this.logStep('No se encontró área de resultado - completando');
                }
                break;

            case 'COMPLETO':
                this.logStep('¡Resta binaria completa!');
                return false;
        }
        
        return true;
    }
}