class TuringMachine {
    constructor() {
        this.tape = [];
        this.head = 0;
        this.state = 'LISTO';
        this.carry = 0;
        this.stepCount = 0;
        this.num1 = '';
        this.num2 = '';
        this.running = false;
        this.steps = [];
        this.digit1 = 0;
        this.digit2 = 0;
        this.processedDigitThisCycle = false; // Rastrear si procesamos algún dígito
    }

    initialize(num1, num2) {
        // Validar entrada binaria
        if (!/^[01]+$/.test(num1) || !/^[01]+$/.test(num2)) {
            alert('Por favor ingrese números binarios válidos (solo 0s y 1s)');
            return false;
        }

        this.num1 = num1;
        this.num2 = num2;
        this.tape = ['#'];
        
        // Agregar primer número
        for (let digit of num1) {
            this.tape.push(digit);
        }
        
        this.tape.push('+');
        
        // Agregar segundo número
        for (let digit of num2) {
            this.tape.push(digit);
        }
        
        this.tape.push('#');
        
        this.head = 0;
        this.state = 'INICIO';
        this.carry = 0;
        this.stepCount = 0;
        this.steps = [];
        this.running = false;
        this.logStep('Máquina inicializada con ' + num1 + ' + ' + num2);
        return true;
    }

    logStep(description) {
        this.steps.push({
            step: this.stepCount,
            state: this.state,
            head: this.head,
            carry: this.carry,
            tape: [...this.tape],
            description: description
        });
    }

    getCurrentSymbol() {
        return this.head >= 0 && this.head < this.tape.length ? this.tape[this.head] : '#';
    }

    writeSymbol(symbol) {
        if (this.head >= 0 && this.head < this.tape.length) {
            this.tape[this.head] = symbol;
        }
    }

    moveRight() {
        this.head++;
        if (this.head >= this.tape.length) {
            this.tape.push('#');
        }
    }

    moveLeft() {
        this.head--;
        if (this.head < 0) {
            this.tape.unshift('#');
            this.head = 0;
        }
    }

    executeStep() {
        this.stepCount++;
        let symbol = this.getCurrentSymbol();
        
        switch (this.state) {
            case 'INICIO':
                // Moverse para encontrar el símbolo + primero
                if (symbol === '+') {
                    this.moveLeft(); // Moverse al dígito más a la derecha del primer número
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
                    this.processedDigitThisCycle = true; // Marcar que procesamos un dígito
                    this.state = 'MOVER_A_SEGUNDO_NUMERO';
                    this.logStep(`Encontrado dígito más a la derecha del primer número: ${this.digit1}, marcado como X`);
                } else if (symbol === '#') {
                    // No más dígitos en el primer número, usar 0 y continuar al segundo número
                    this.digit1 = 0;
                    this.state = 'MOVER_A_SEGUNDO_NUMERO';
                    this.logStep('Primer número agotado, usando dígito1 = 0, moviéndose al segundo número');
                } else {
                    this.moveLeft();
                    this.logStep('Moviéndose a la izquierda para encontrar el dígito no procesado más a la derecha');
                }
                break;

            case 'MOVER_A_SEGUNDO_NUMERO':
                // Moverse a la derecha hasta pasar el símbolo +
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
                    // Hemos ido demasiado lejos, moverse hacia atrás para encontrar el dígito más a la derecha
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
                    this.processedDigitThisCycle = true; // Marcar que procesamos un dígito
                    this.state = 'MOVER_A_AREA_RESULTADO';
                    this.logStep(`Encontrado dígito más a la derecha del segundo número: ${this.digit2}, marcado como X`);
                } else if (symbol === '+') {
                    // No más dígitos en el segundo número, pero podríamos tener acarreo o dígito1
                    this.digit2 = 0;
                    this.state = 'MOVER_A_AREA_RESULTADO';
                    this.logStep('Segundo número agotado, usando dígito2 = 0, continuando con la suma');
                } else {
                    this.moveLeft();
                    this.logStep('Moviéndose a la izquierda para encontrar el dígito no procesado más a la derecha');
                }
                break;

            case 'MOVER_A_AREA_RESULTADO':
                // Moverse a la derecha para encontrar o crear el área de resultado
                if (symbol === '=') {
                    this.moveRight();
                    this.state = 'AGREGAR_DIGITO_RESULTADO';
                    this.logStep('Encontrado =, moviéndose al área de resultado');
                } else if (symbol === '#') {
                    // Necesita crear el símbolo =
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
                
                // Encontrar la posición más a la derecha en el área de resultado para agregar el dígito
                if (symbol === '#') {
                    // Estamos al final, insertar el dígito aquí
                    this.tape.splice(this.head, 0, resultDigit.toString());
                    this.logStep(`Agregado dígito resultado ${resultDigit} en la posición más a la derecha (${this.digit1} + ${this.digit2} + ${oldCarry} = ${sum}), acarreo = ${this.carry}`);
                } else {
                    // Ya hay dígitos, moverse al final y agregar allí
                    while (this.head < this.tape.length && this.getCurrentSymbol() !== '#') {
                        this.moveRight();
                        this.logStep('Moviéndose a la derecha para encontrar el final del área de resultado');
                    }
                    // Insertar el dígito en la posición más a la derecha
                    this.tape.splice(this.head, 0, resultDigit.toString());
                    this.logStep(`Agregado dígito resultado ${resultDigit} al final del resultado (${this.digit1} + ${this.digit2} + ${oldCarry} = ${sum}), acarreo = ${this.carry}`);
                }
                
                this.state = 'REGRESAR_AL_INICIO';
                break;

            case 'REGRESAR_AL_INICIO':
                // Moverse de vuelta al principio para procesar los siguientes dígitos
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
                // Verificar si procesamos algún dígito en este ciclo
                if (!this.processedDigitThisCycle && this.carry === 0) {
                    // No se procesaron dígitos y no hay acarreo, verificar si realmente hay más dígitos
                    let hasUnprocessedDigits = false;
                    
                    // Escaneo completo para cualquier dígito no procesado en cualquier lugar antes de =
                    for (let i = 1; i < this.tape.length; i++) {
                        if (this.tape[i] === '=') {
                            break; // Parar en el área de resultado
                        }
                        if (this.tape[i] === '0' || this.tape[i] === '1') {
                            hasUnprocessedDigits = true;
                            this.logStep(`Encontrado dígito no procesado '${this.tape[i]}' en la posición ${i}`);
                            break;
                        }
                    }
                    
                    if (hasUnprocessedDigits) {
                        // Forzar continuación del procesamiento - resetear bandera y reiniciar
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
                    // No hay dígitos pero tenemos acarreo que manejar
                    this.state = 'MANEJAR_ACARREO_FINAL';
                    this.logStep('No se procesaron dígitos pero queda acarreo, manejando acarreo final');
                    return true;
                }
                
                // Resetear la bandera para el siguiente ciclo
                this.processedDigitThisCycle = false;
                
                // Escanear a través de la cinta para ver si hay dígitos no procesados (0 o 1)
                if ((symbol === '0' || symbol === '1') && this.head < this.tape.length) {
                    // Encontrado dígito no procesado antes del signo =
                    let beforeEquals = true;
                    for (let i = this.head; i < this.tape.length; i++) {
                        if (this.tape[i] === '=') {
                            beforeEquals = true;
                            break;
                        }
                    }
                    
                    if (beforeEquals) {
                        // Este es un dígito no procesado, continuar procesamiento
                        this.state = 'MOVER_A_MAS';
                        this.logStep('Encontrados más dígitos no procesados, continuando suma');
                        return true;
                    }
                }
                
                if (symbol === '=' || symbol === '#') {
                    // Alcanzado el final del área de entrada, verificar si encontramos algún dígito no procesado
                    let hasUnprocessedDigits = false;
                    
                    // Escanear toda el área de entrada (antes de =) para cualquier 0 o 1 restante
                    for (let i = 1; i < this.tape.length; i++) {
                        if (this.tape[i] === '=') {
                            break; // Parar en el área de resultado
                        }
                        if (this.tape[i] === '0' || this.tape[i] === '1') {
                            hasUnprocessedDigits = true;
                            break;
                        }
                    }
                    
                    if (hasUnprocessedDigits) {
                        // Regresar al inicio para procesar los dígitos restantes
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
                // Moverse al símbolo + para reiniciar el proceso
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
                    // Moverse al área de resultado para agregar el acarreo final
                    if (symbol === '=') {
                        this.moveRight();
                        this.logStep('Moviéndose al área de resultado para agregar acarreo final');
                    } else if (symbol === '#') {
                        // Estamos al final, agregar el acarreo aquí
                        this.tape.splice(this.head, 0, this.carry.toString());
                        this.logStep(`Agregado dígito de acarreo final ${this.carry} al final del resultado`);
                        this.carry = 0;
                        this.state = 'LIMPIEZA';
                    } else {
                        // Moverse al final del área de resultado
                        this.moveRight();
                        this.logStep('Moviéndose al final del área de resultado para acarreo final');
                    }
                } else {
                    this.state = 'LIMPIEZA';
                }
                break;

            case 'LIMPIEZA':
                // Extraer resultado directamente y mostrar respuesta final
                this.logStep('Iniciando limpieza - extrayendo resultado final');
                
                // Encontrar posición = directamente
                let equalsPos = -1;
                for (let i = 0; i < this.tape.length; i++) {
                    if (this.tape[i] === '=') {
                        equalsPos = i;
                        break;
                    }
                }
                
                if (equalsPos !== -1) {
                    // Extraer dígitos del resultado
                    let result = [];
                    for (let i = equalsPos + 1; i < this.tape.length; i++) {
                        if (this.tape[i] !== '#' && this.tape[i] !== '' && /[01]/.test(this.tape[i])) {
                            result.push(this.tape[i]);
                        }
                    }
                    
                    if (result.length > 0) {
                        // Invertir resultado (ya que lo construimos de derecha a izquierda)
                        result.reverse();
                        
                        // Limpiar cinta y escribir resultado final
                        this.tape = ['#'];
                        for (let digit of result) {
                            this.tape.push(digit);
                        }
                        this.tape.push('#');
                        this.head = 1;
                        this.state = 'COMPLETO';
                        this.logStep(`Resultado final: ${result.join('')} (${this.num1} + ${this.num2} = ${result.join('')})`);
                    } else {
                        // No se encontró resultado
                        this.state = 'COMPLETO';
                        this.logStep('No se encontraron dígitos de resultado - completando');
                    }
                } else {
                    // No se encontró signo igual
                    this.state = 'COMPLETO';
                    this.logStep('No se encontró área de resultado - completando');
                }
                break;

            case 'COMPLETO':
                this.logStep('¡Suma binaria completa!');
                return false; // Parar ejecución
        }
        
        return true; // Continuar ejecución
    }
}

const machine = new TuringMachine();

function updateDisplay() {
    const tapeElement = document.getElementById('tape');
    tapeElement.innerHTML = '';
    
    for (let i = 0; i < machine.tape.length; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = machine.tape[i] === '#' ? '∅' : machine.tape[i];
        
        if (machine.tape[i] === '#') {
            cell.classList.add('empty');
        }
        
        if (i === machine.head) {
            cell.classList.add('head');
        }
        
        tapeElement.appendChild(cell);
    }
    
    document.getElementById('state').textContent = machine.state;
    document.getElementById('position').textContent = machine.head;
    document.getElementById('carry').textContent = machine.carry;
    document.getElementById('stepCount').textContent = machine.stepCount;
    
    // Actualizar visualización de pasos
    const stepDisplay = document.getElementById('stepDisplay');
    stepDisplay.innerHTML = '';
    
    for (let i = Math.max(0, machine.steps.length - 10); i < machine.steps.length; i++) {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step';
        if (i === machine.steps.length - 1) {
            stepDiv.classList.add('current-step');
        }
        stepDiv.textContent = `Paso ${machine.steps[i].step}: ${machine.steps[i].description}`;
        stepDisplay.appendChild(stepDiv);
    }
    
    stepDisplay.scrollTop = stepDisplay.scrollHeight;
}

function initializeMachine() {
    const num1 = document.getElementById('num1').value.trim();
    const num2 = document.getElementById('num2').value.trim();
    
    if (machine.initialize(num1, num2)) {
        updateDisplay();
        document.getElementById('stepBtn').disabled = false;
        document.getElementById('runBtn').disabled = false;
    }
}

function stepForward() {
    if (machine.state !== 'COMPLETO') {
        machine.executeStep();
        updateDisplay();
        
        if (machine.state === 'COMPLETO') {
            document.getElementById('stepBtn').disabled = true;
            document.getElementById('runBtn').disabled = true;
        }
    }
}

function runAutomatic() {
    if (machine.running) return;
    
    machine.running = true;
    document.getElementById('runBtn').disabled = true;
    document.getElementById('stepBtn').disabled = true;
    
    const speed = parseInt(document.getElementById('speed').value);
    
    const runStep = () => {
        if (machine.state !== 'COMPLETO' && machine.running) {
            machine.executeStep();
            updateDisplay();
            setTimeout(runStep, speed);
        } else {
            machine.running = false;
            document.getElementById('runBtn').disabled = machine.state === 'COMPLETO';
            document.getElementById('stepBtn').disabled = machine.state === 'COMPLETO';
        }
    };
    
    runStep();
}

function resetMachine() {
    machine.running = false;
    machine.tape = [];
    machine.head = 0;
    machine.state = 'LISTO';
    machine.carry = 0;
    machine.stepCount = 0;
    machine.steps = [];
    
    document.getElementById('stepBtn').disabled = true;
    document.getElementById('runBtn').disabled = true;
    document.getElementById('stepDisplay').innerHTML = '';
    
    const tapeElement = document.getElementById('tape');
    tapeElement.innerHTML = '<div class="cell empty">Listo para inicializar...</div>';
    
    document.getElementById('state').textContent = 'LISTO';
    document.getElementById('position').textContent = '-';
    document.getElementById('carry').textContent = '0';
    document.getElementById('stepCount').textContent = '0';
}

// Control de velocidad
document.getElementById('speed').addEventListener('input', function() {
    document.getElementById('speedValue').textContent = this.value + 'ms';
});

// Inicializar con valores predeterminados al cargar
window.addEventListener('load', function() {
    resetMachine();
});

// Permitir tecla Enter para inicializar
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !machine.running) {
        initializeMachine();
    }
});