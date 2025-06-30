// js/operations/sum.js
class SumTuringMachine extends BaseTuringMachine {
    constructor() {
        super();
        this.carry = 0;
        this.digit1 = 0;
        this.digit2 = 0;
        this.processedDigitThisCycle = false;
    }

    initialize(num1, num2) {
        if (!this.validateBinaryInput(num1, num2)) {
            return false;
        }

        this.initializeBaseTape(num1, num2, '+');
        this.state = 'INICIO';
        this.carry = 0;
        this.logStep('Máquina inicializada para suma: ' + num1 + ' + ' + num2);
        return true;
    }

    executeStep() {
        this.stepCount++;
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
                        
                        this.tape = ['#'];
                        for (let digit of result) {
                            this.tape.push(digit);
                        }
                        this.tape.push('#');
                        this.head = 1;
                        this.state = 'COMPLETO';
                        this.logStep(`Resultado final: ${result.join('')} (${this.num1} + ${this.num2} = ${result.join('')})`);
                    } else {
                        this.state = 'COMPLETO';
                        this.logStep('No se encontraron dígitos de resultado - completando');
                    }
                } else {
                    this.state = 'COMPLETO';
                    this.logStep('No se encontró área de resultado - completando');
                }
                break;

            case 'COMPLETO':
                this.logStep('¡Suma binaria completa!');
                return false;
        }
        
        return true;
    }
}