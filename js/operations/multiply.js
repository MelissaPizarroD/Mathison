// js/operations/multiply.js
class MultiplyTuringMachine extends BaseTuringMachine {
    constructor() {
        super();
        this.multiplierBit = 0;
        this.multiplicandCopy = '';
        this.processedDigitThisCycle = false;
        this.currentShift = 0;
        this.needsPartialSum = false;
    }

    initialize(num1, num2) {
        if (!this.validateBinaryInput(num1, num2)) {
            return false;
        }

        this.initializeBaseTape(num1, num2, '*');
        this.state = 'INICIO';
        this.multiplierBit = 0;
        this.multiplicandCopy = '';
        this.processedDigitThisCycle = false;
        this.currentShift = 0;
        this.needsPartialSum = false;
        this.logStep('Máquina inicializada para multiplicación: ' + num1 + ' * ' + num2);
        return true;
    }

    executeStep() {
        this.stepCount++;
        let symbol = this.getCurrentSymbol();
        
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
                    this.logStep('Alcanzado final, comenzando procesamiento del multiplicador de derecha a izquierda');
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
                        this.state = 'COPIAR_MULTIPLICANDO';
                        this.needsPartialSum = true;
                        this.logStep('Bit es 1, necesario copiar multiplicando con desplazamiento');
                    } else {
                        this.state = 'SIGUIENTE_BIT_MULTIPLICADOR';
                        this.needsPartialSum = false;
                        this.logStep('Bit es 0, saltando (equivale a sumar 0)');
                    }
                } else if (symbol === '*') {
                    this.state = 'LIMPIEZA_FINAL';
                    this.logStep('Terminado procesamiento de multiplicador, iniciando limpieza');
                } else {
                    this.moveLeft();
                    this.logStep('Buscando siguiente bit no procesado del multiplicador');
                }
                break;

            case 'COPIAR_MULTIPLICANDO':
                // Copiar el multiplicando con desplazamiento para crear el producto parcial
                this.multiplicandCopy = this.num1; // multiplicando original
                
                // Agregar desplazamiento (ceros a la derecha)
                for (let i = 0; i < this.currentShift; i++) {
                    this.multiplicandCopy += '0';
                }
                
                this.logStep(`Multiplicando con desplazamiento ${this.currentShift}: ${this.multiplicandCopy}`);
                this.state = 'BUSCAR_AREA_RESULTADO';
                break;

            case 'BUSCAR_AREA_RESULTADO':
                if (symbol === '=') {
                    this.moveRight();
                    this.state = 'SUMAR_PRODUCTO_PARCIAL';
                    this.logStep('Encontrado área de resultado, sumando producto parcial');
                } else if (symbol === '#') {
                    // Crear área de resultado solo cuando sea necesario
                    this.writeSymbol('=');
                    this.moveRight();
                    if (this.head >= this.tape.length) {
                        this.tape.push('#');
                    }
                    this.state = 'SUMAR_PRODUCTO_PARCIAL';
                    this.logStep('Creado área de resultado, sumando producto parcial');
                } else {
                    this.moveRight();
                    this.logStep('Buscando área de resultado');
                }
                break;

            case 'SUMAR_PRODUCTO_PARCIAL':
                // Extraer resultado actual del área =
                let resultadoActual = '';
                let sumEqualsPos = -1;
                
                // Encontrar posición del =
                for (let i = 0; i < this.tape.length; i++) {
                    if (this.tape[i] === '=') {
                        sumEqualsPos = i;
                        break;
                    }
                }
                
                // Extraer número actual del resultado
                if (sumEqualsPos !== -1) {
                    for (let i = sumEqualsPos + 1; i < this.tape.length; i++) {
                        if (this.tape[i] !== '#') {
                            resultadoActual += this.tape[i];
                        }
                    }
                }
                
                // Si no hay resultado actual, usar '0'
                if (resultadoActual === '') {
                    resultadoActual = '0';
                }
                
                // Realizar suma del resultado actual + producto parcial
                let nuevoResultado = this.addBinaryNumbers(resultadoActual, this.multiplicandCopy);
                
                // Actualizar resultado en la cinta
                if (sumEqualsPos !== -1) {
                    this.tape.splice(sumEqualsPos + 1);
                    for (let digit of nuevoResultado) {
                        this.tape.push(digit);
                    }
                    this.tape.push('#');
                }
                
                this.logStep(`Suma: ${resultadoActual} + ${this.multiplicandCopy} = ${nuevoResultado}`);
                this.state = 'SIGUIENTE_BIT_MULTIPLICADOR';
                break;

            case 'SIGUIENTE_BIT_MULTIPLICADOR':
                this.currentShift++;
                this.state = 'REGRESAR_AL_INICIO';
                this.logStep(`Incrementando desplazamiento a ${this.currentShift}, regresando al inicio`);
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
                // Verificar si hay más bits del multiplicador por procesar
                if (!this.processedDigitThisCycle) {
                    let hasUnprocessedBits = false;
                    
                    // Buscar en el multiplicador (después del *)
                    let multiplicadorStart = -1;
                    for (let i = 1; i < this.tape.length; i++) {
                        if (this.tape[i] === '*') {
                            multiplicadorStart = i + 1;
                            break;
                        }
                    }
                    
                    if (multiplicadorStart !== -1) {
                        for (let i = multiplicadorStart; i < this.tape.length; i++) {
                            if (this.tape[i] === '=' || this.tape[i] === '#') {
                                break;
                            }
                            if (this.tape[i] === '0' || this.tape[i] === '1') {
                                hasUnprocessedBits = true;
                                this.logStep(`Encontrado bit no procesado '${this.tape[i]}' en posición ${i}`);
                                break;
                            }
                        }
                    }
                    
                    if (hasUnprocessedBits) {
                        this.processedDigitThisCycle = false;
                        this.head = 0;
                        this.state = 'INICIO';
                        this.logStep('Encontrados más bits, continuando multiplicación');
                        return true;
                    } else {
                        this.state = 'LIMPIEZA_FINAL';
                        this.logStep('Todos los bits procesados, iniciando limpieza');
                        return true;
                    }
                }
                
                this.processedDigitThisCycle = false;
                
                // Buscar multiplicador para continuar
                if (symbol === '*') {
                    this.moveRight();
                    this.state = 'IR_AL_FINAL_MULTIPLICADOR';
                    this.logStep('Continuando con siguiente bit del multiplicador');
                } else {
                    this.moveRight();
                    this.logStep('Buscando * para continuar procesamiento');
                }
                break;

            case 'LIMPIEZA_FINAL':
                this.logStep('Iniciando limpieza - extrayendo resultado final');
                
                let resultEqualsPos = -1;
                for (let i = 0; i < this.tape.length; i++) {
                    if (this.tape[i] === '=') {
                        resultEqualsPos = i;
                        break;
                    }
                }
                
                if (resultEqualsPos !== -1) {
                    let result = [];
                    for (let i = resultEqualsPos + 1; i < this.tape.length; i++) {
                        if (this.tape[i] !== '#' && this.tape[i] !== '' && /[01]/.test(this.tape[i])) {
                            result.push(this.tape[i]);
                        }
                    }
                    
                    if (result.length > 0) {
                        let finalResult = result.join('');
                        
                        this.tape = ['#'];
                        for (let digit of finalResult) {
                            this.tape.push(digit);
                        }
                        this.tape.push('#');
                        this.head = 1;
                        this.state = 'COMPLETO';
                        this.logStep(`Resultado final: ${finalResult} (${this.num1} * ${this.num2} = ${finalResult})`);
                    } else {
                        this.tape = ['#', '0', '#'];
                        this.head = 1;
                        this.state = 'COMPLETO';
                        this.logStep(`Resultado final: 0 (${this.num1} * ${this.num2} = 0)`);
                    }
                } else {
                    // Si no hay área de resultado, el resultado es 0
                    this.tape = ['#', '0', '#'];
                    this.head = 1;
                    this.state = 'COMPLETO';
                    this.logStep(`Resultado final: 0 (${this.num1} * ${this.num2} = 0)`);
                }
                break;

            case 'COMPLETO':
                this.logStep('¡Multiplicación binaria completa!');
                return false;
        }
        
        return true;
    }

    // Función auxiliar para sumar dos números binarios
    addBinaryNumbers(num1, num2) {
        if (!num1) num1 = '0';
        if (!num2) num2 = '0';
        
        let result = '';
        let carry = 0;
        let i = num1.length - 1;
        let j = num2.length - 1;
        
        while (i >= 0 || j >= 0 || carry > 0) {
            let digit1 = i >= 0 ? parseInt(num1[i]) : 0;
            let digit2 = j >= 0 ? parseInt(num2[j]) : 0;
            
            let sum = digit1 + digit2 + carry;
            result = (sum % 2) + result;
            carry = Math.floor(sum / 2);
            
            i--;
            j--;
        }
        
        return result || '0';
    }
}