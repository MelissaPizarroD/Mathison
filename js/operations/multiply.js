// js/operations/multiply.js
class MultiplyTuringMachine extends BaseTuringMachine {
    constructor() {
        super();
        this.digit1 = 0;
        this.digit2 = 0;
        this.processedDigitThisCycle = false;
        this.currentShift = 0;
    }

    initialize(num1, num2) {
        if (!this.validateBinaryInput(num1, num2)) {
            return false;
        }

        // Advertencia: Por ahora solo máximo 2 dígitos en num2
        if (num2.length > 2) {
            alert('⚠️ Por ahora la multiplicación solo soporta máximo 2 dígitos en el segundo número (multiplicador)');
            return false;
        }

        this.initializeBaseTape(num1, num2, '*');
        this.state = 'INICIO';
        this.digit1 = 0;
        this.digit2 = 0;
        this.processedDigitThisCycle = false;
        this.currentShift = 0;
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
                    this.state = 'BUSCAR_FINAL_MULTIPLICADOR';
                    this.logStep('Encontrado *, moviéndose al final del multiplicador');
                } else {
                    this.moveRight();
                    this.logStep('Buscando el símbolo *');
                }
                break;

            case 'BUSCAR_FINAL_MULTIPLICADOR':
                if (symbol === '#' || symbol === '=' || symbol === '+') {
                    this.moveLeft();
                    // Verificar si ya hay un dígito A/B procesado en el multiplicador
                    let hayDigitoMarcadoEnMultiplicador = false;
                    let afterStar = false;
                    for (let i = 1; i < this.tape.length; i++) {
                        if (this.tape[i] === '*') {
                            afterStar = true;
                            continue;
                        }
                        if (afterStar && (this.tape[i] === '=' || this.tape[i] === '+')) break;
                        if (afterStar && (this.tape[i] === 'A' || this.tape[i] === 'B')) {
                            hayDigitoMarcadoEnMultiplicador = true;
                            break;
                        }
                    }
                    
                    if (hayDigitoMarcadoEnMultiplicador) {
                        this.state = 'BUSCAR_MULTIPLICANDO_DERECHO';
                        this.logStep('Dígito del multiplicador ya marcado, procesando multiplicando');
                    } else {
                        this.state = 'OBTENER_DIGITO_MULTIPLICADOR';
                        this.logStep('Obteniendo nuevo dígito del multiplicador');
                    }
                } else {
                    this.moveRight();
                    this.logStep('Moviéndose al final del multiplicador');
                }
                break;

            case 'OBTENER_DIGITO_MULTIPLICADOR':
                if (symbol === '0' || symbol === '1') {
                    this.digit2 = parseInt(symbol);
                    this.writeSymbol(symbol === '0' ? 'A' : 'B');
                    this.state = 'BUSCAR_MULTIPLICANDO_DERECHO';
                    this.logStep(`Dígito del multiplicador: ${this.digit2}, marcado como ${symbol === '0' ? 'A' : 'B'}`);
                } else if (symbol === '*') {
                    // No hay más dígitos 0 o 1 en el multiplicador
                    this.state = 'VERIFICAR_SOLO_XY_EN_MULTIPLICADOR';
                    this.logStep('No hay más dígitos 0/1 en multiplicador, verificando si solo quedan X/Y');
                } else {
                    this.moveLeft();
                    this.logStep('Buscando dígito 0 o 1 en multiplicador');
                }
                break;

            case 'BUSCAR_MULTIPLICANDO_DERECHO':
                if (symbol === '*') {
                    this.moveLeft();
                    this.state = 'OBTENER_DIGITO_MULTIPLICANDO';
                    this.logStep('Encontrado *, buscando dígito más a la derecha del multiplicando');
                } else {
                    this.moveLeft();
                    this.logStep('Moviéndose hacia el multiplicando');
                }
                break;

            case 'OBTENER_DIGITO_MULTIPLICANDO':
                if (symbol === '0' || symbol === '1') {
                    this.digit1 = parseInt(symbol);
                    this.writeSymbol(symbol === '0' ? 'A' : 'B');
                    this.state = 'IR_A_AREA_RESULTADO';
                    this.logStep(`Dígito del multiplicando: ${this.digit1}, marcado como ${symbol === '0' ? 'A' : 'B'}`);
                } else if (symbol === '#') {
                    this.digit1 = 0;
                    this.state = 'IR_A_AREA_RESULTADO';
                    this.logStep('Multiplicando agotado, usando 0');
                } else {
                    this.moveLeft();
                    this.logStep('Buscando dígito 0 o 1 en multiplicando');
                }
                break;

            case 'IR_A_AREA_RESULTADO':
                if (symbol === '=') {
                    this.moveRight();
                    // Determinar si es primer o segundo dígito del multiplicador
                    let hayPlus = false;
                    for (let i = 0; i < this.tape.length; i++) {
                        if (this.tape[i] === '+') {
                            hayPlus = true;
                            break;
                        }
                    }
                    
                    if (hayPlus) {
                        this.state = 'BUSCAR_PLUS_PARA_SEGUNDO';
                        this.logStep('Encontrado =, es segundo dígito, buscando + para escribir resultado');
                    } else {
                        this.state = 'ESCRIBIR_PRIMER_RESULTADO';
                        this.logStep('Encontrado =, es primer dígito, escribiendo resultado');
                    }
                } else if (symbol === '#') {
                    this.writeSymbol('=');
                    this.moveRight();
                    this.state = 'ESCRIBIR_PRIMER_RESULTADO';
                    this.logStep('Creado símbolo =, escribiendo primer resultado');
                } else {
                    this.moveRight();
                    this.logStep('Buscando área de resultado');
                }
                break;

            case 'ESCRIBIR_PRIMER_RESULTADO':
                let producto1 = (this.digit1 * this.digit2).toString();
                
                if (symbol === '#') {
                    // Estamos en una posición vacía, escribir el resultado
                    this.writeSymbol(producto1);
                    this.logStep(`Multiplicación (primer dígito): ${this.digit1} × ${this.digit2} = ${producto1}, escrito`);
                    this.state = 'REGRESAR_AL_INICIO';
                } else if (symbol === '0' || symbol === '1') {
                    // Ya hay un dígito, buscar siguiente posición
                    this.moveRight();
                    this.logStep('Posición ocupada, buscando siguiente posición libre');
                } else {
                    // Escribir el resultado en posición actual
                    this.writeSymbol(producto1);
                    this.logStep(`Multiplicación (primer dígito): ${this.digit1} × ${this.digit2} = ${producto1}, escrito`);
                    this.state = 'REGRESAR_AL_INICIO';
                }
                break;

            case 'BUSCAR_PLUS_PARA_SEGUNDO':
                if (symbol === '+') {
                    this.moveRight();
                    this.state = 'ESCRIBIR_SEGUNDO_RESULTADO';
                    this.logStep('Encontrado +, posicionándose para escribir resultado del segundo dígito');
                } else {
                    this.moveRight();
                    this.logStep('Buscando símbolo + para segundo resultado');
                }
                break;

            case 'ESCRIBIR_SEGUNDO_RESULTADO':
                let producto2 = (this.digit1 * this.digit2).toString();
                
                if (symbol === '#') {
                    // Si necesitamos agregar ceros de desplazamiento
                    if (this.currentShift > 1) {
                        // Escribir un cero primero
                        this.writeSymbol('0');
                        this.currentShift--;
                        this.moveRight();
                        this.logStep(`Escribiendo cero de desplazamiento, faltan ${this.currentShift - 1}`);
                    } else {
                        // Escribir el resultado
                        this.writeSymbol(producto2);
                        this.logStep(`Multiplicación (segundo dígito): ${this.digit1} × ${this.digit2} = ${producto2}, escrito`);
                        this.state = 'REGRESAR_AL_INICIO';
                    }
                } else if (symbol === '0') {
                    // Saltamos ceros existentes
                    this.moveRight();
                    this.logStep('Saltando cero existente');
                } else if (symbol === '1') {
                    // Ya hay un resultado, buscar siguiente posición
                    this.moveRight();
                    this.logStep('Posición ocupada, buscando siguiente posición libre');
                } else {
                    // Escribir el resultado en posición actual
                    this.writeSymbol(producto2);
                    this.logStep(`Multiplicación (segundo dígito): ${this.digit1} × ${this.digit2} = ${producto2}, escrito`);
                    this.state = 'REGRESAR_AL_INICIO';
                }
                break;

            case 'REGRESAR_AL_INICIO':
                if (symbol === '#' && this.head === 0) {
                    this.moveRight();
                    this.state = 'VERIFICAR_MAS_DIGITOS_MULTIPLICANDO';
                    this.logStep('Regresado al inicio, verificando más dígitos');
                } else {
                    this.moveLeft();
                    this.logStep('Moviéndose a la izquierda para regresar al inicio');
                }
                break;

            case 'VERIFICAR_MAS_DIGITOS_MULTIPLICANDO':
                // Verificar si hay más 0s o 1s en el multiplicando
                let hayMasMultiplicando = false;
                for (let i = 1; i < this.tape.length; i++) {
                    if (this.tape[i] === '*') break;
                    if (this.tape[i] === '0' || this.tape[i] === '1') {
                        hayMasMultiplicando = true;
                        break;
                    }
                }
                
                if (hayMasMultiplicando) {
                    this.state = 'INICIO';
                    this.logStep('Hay más dígitos 0/1 en multiplicando, continuando con el mismo dígito del multiplicador');
                } else {
                    this.state = 'CONVERTIR_LETRAS_MULTIPLICANDO';
                    this.logStep('Multiplicando completamente procesado, procediendo con conversiones');
                }
                break;

            case 'CONVERTIR_LETRAS_MULTIPLICANDO':
                // Convertir A→0, B→1 solo ANTES del *
                for (let i = 1; i < this.tape.length; i++) {
                    if (this.tape[i] === '*') break;
                    if (this.tape[i] === 'A') this.tape[i] = '0';
                    if (this.tape[i] === 'B') this.tape[i] = '1';
                }
                this.logStep('Convertido multiplicando: A→0, B→1');
                this.state = 'CONVERTIR_LETRA_MULTIPLICADOR_A_X_Y';
                break;

            case 'CONVERTIR_LETRA_MULTIPLICADOR_A_X_Y':
                // Convertir A→X, B→Y solo DESPUÉS del * y ANTES del =
                let pastStar = false;
                for (let i = 1; i < this.tape.length; i++) {
                    if (this.tape[i] === '*') {
                        pastStar = true;
                        continue;
                    }
                    if (pastStar && (this.tape[i] === '=' || this.tape[i] === '+')) break;
                    if (pastStar && this.tape[i] === 'A') this.tape[i] = 'X';
                    if (pastStar && this.tape[i] === 'B') this.tape[i] = 'Y';
                }
                this.logStep('Convertido multiplicador procesado: A→X, B→Y');
                this.state = 'VERIFICAR_MAS_DIGITOS_MULTIPLICADOR_REAL';
                break;

            case 'VERIFICAR_MAS_DIGITOS_MULTIPLICADOR_REAL':
                // Verificar si hay más 0s o 1s en el multiplicador
                let hayMasMultiplicador = false;
                let afterStar = false;
                for (let i = 1; i < this.tape.length; i++) {
                    if (this.tape[i] === '*') {
                        afterStar = true;
                        continue;
                    }
                    if (afterStar && (this.tape[i] === '=' || this.tape[i] === '+')) break;
                    if (afterStar && (this.tape[i] === '0' || this.tape[i] === '1')) {
                        hayMasMultiplicador = true;
                        break;
                    }
                }
                
                if (hayMasMultiplicador) {
                    this.state = 'AGREGAR_DESPLAZAMIENTO';
                    this.logStep('Hay más dígitos en multiplicador, agregando desplazamiento y continuando');
                } else {
                    this.state = 'VERIFICAR_SOLO_XY_EN_MULTIPLICADOR';
                    this.logStep('No hay más dígitos en multiplicador, verificando si completamos todos');
                }
                break;

            case 'AGREGAR_DESPLAZAMIENTO':
                if (symbol === '=') {
                    this.moveRight();
                    this.logStep('Encontrado =, buscando final de primera sección de resultados');
                } else if (symbol === '#') {
                    // Estamos al final de la primera sección de resultados
                    this.writeSymbol('+');
                    // Escribir ceros de desplazamiento inmediatamente
                    for (let i = 0; i < this.currentShift; i++) {
                        this.moveRight();
                        this.writeSymbol('0');
                        this.logStep(`Escribiendo cero de desplazamiento ${i + 1} de ${this.currentShift}`);
                    }
                    this.moveRight();
                    this.writeSymbol('#');
                    this.currentShift++;
                    this.state = 'REGRESAR_AL_INICIO';
                    this.logStep(`Agregados ${this.currentShift - 1} ceros de desplazamiento después del +`);
                } else if (symbol === '0' || symbol === '1') {
                    // Hay más resultados, continuar buscando el final
                    this.moveRight();
                    this.logStep('Saltando dígito de resultado existente');
                } else {
                    this.moveRight();
                    this.logStep('Buscando final de primera sección para agregar +');
                }
                break;

            case 'VERIFICAR_SOLO_XY_EN_MULTIPLICADOR':
                // Verificar si en el multiplicador solo quedan X e Y
                let soloXY = true;
                let afterStar2 = false;
                for (let i = 1; i < this.tape.length; i++) {
                    if (this.tape[i] === '*') {
                        afterStar2 = true;
                        continue;
                    }
                    if (afterStar2 && (this.tape[i] === '=' || this.tape[i] === '+')) break;
                    if (afterStar2 && this.tape[i] !== 'X' && this.tape[i] !== 'Y') {
                        soloXY = false;
                        break;
                    }
                }
                
                if (soloXY) {
                    this.state = 'INVERTIR_RESULTADOS';
                    this.logStep('Solo quedan X/Y en multiplicador, comenzando inversión de resultados');
                } else {
                    this.state = 'INICIO';
                    this.logStep('Aún hay dígitos por procesar, continuando');
                }
                break;

            case 'INVERTIR_RESULTADOS':
                this.logStep('Invirtiendo resultados parciales para preparar suma');
                
                // Encontrar todas las secciones de resultados y invertirlas
                let resultados = [];
                let seccionActual = [];
                let enResultado = false;
                
                for (let i = 0; i < this.tape.length; i++) {
                    if (this.tape[i] === '=') {
                        enResultado = true;
                        continue;
                    }
                    if (this.tape[i] === '+') {
                        if (seccionActual.length > 0) {
                            resultados.push([...seccionActual]);
                            seccionActual = [];
                        }
                        continue;
                    }
                    if (this.tape[i] === '#') {
                        if (seccionActual.length > 0) {
                            resultados.push([...seccionActual]);
                        }
                        break;
                    }
                    if (enResultado && /[01]/.test(this.tape[i])) {
                        seccionActual.push(this.tape[i]);
                    }
                }
                
                // Invertir cada resultado y reconstruir la cinta
                this.tape = this.tape.slice(0, this.tape.indexOf('=') + 1);
                
                for (let i = 0; i < resultados.length; i++) {
                    let resultadoInvertido = resultados[i].reverse();
                    this.tape = this.tape.concat(resultadoInvertido);
                    if (i < resultados.length - 1) {
                        this.tape.push('+');
                    }
                }
                this.tape.push('#');
                
                this.logStep('Resultados invertidos, preparando para suma usando algoritmo de suma');
                this.state = 'PREPARAR_SUMA';
                break;

            case 'PREPARAR_SUMA':
                this.logStep('Implementando algoritmo de suma para los productos parciales');
                
                // Crear una instancia temporal de suma para procesar
                let sumMachine = new SumTuringMachine();
                
                // Extraer los números a sumar
                let numeros = [];
                let numeroActual = '';
                let enResultado2 = false;
                
                for (let i = 0; i < this.tape.length; i++) {
                    if (this.tape[i] === '=') {
                        enResultado2 = true;
                        continue;
                    }
                    if (this.tape[i] === '+') {
                        if (numeroActual) {
                            numeros.push(numeroActual);
                            numeroActual = '';
                        }
                        continue;
                    }
                    if (this.tape[i] === '#') {
                        if (numeroActual) {
                            numeros.push(numeroActual);
                        }
                        break;
                    }
                    if (enResultado2 && /[01]/.test(this.tape[i])) {
                        numeroActual += this.tape[i];
                    }
                }
                
                // Sumar todos los números usando el algoritmo binario
                let resultado = numeros.length > 0 ? numeros[0] : '0';
                for (let i = 1; i < numeros.length; i++) {
                    resultado = this.addBinaryNumbers(resultado, numeros[i]);
                }
                
                // Mostrar resultado final
                this.tape = ['#'];
                for (let digit of resultado) {
                    this.tape.push(digit);
                }
                this.tape.push('#');
                this.head = 1;
                this.state = 'COMPLETO';
                this.logStep(`Resultado final de multiplicación: ${resultado} (${this.num1} * ${this.num2} = ${resultado})`);
                break;

            case 'COMPLETO':
                this.logStep('¡Multiplicación binaria completa!');
                return false;
        }
        
        return true;
    }

    // Función auxiliar para sumar dos números binarios (algoritmo de suma)
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

    // Función auxiliar para calcular el nivel de desplazamiento actual
    getCurrentShiftLevel() {
        // Contar cuántos X/Y hay en el multiplicador para determinar el nivel
        let count = 0;
        let afterStar = false;
        for (let i = 1; i < this.tape.length; i++) {
            if (this.tape[i] === '*') {
                afterStar = true;
                continue;
            }
            if (afterStar && (this.tape[i] === '=' || this.tape[i] === '+')) break;
            if (afterStar && (this.tape[i] === 'X' || this.tape[i] === 'Y')) {
                count++;
            }
        }
        return count;
    }
}