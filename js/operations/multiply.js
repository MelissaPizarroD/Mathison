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
                    // Si lo hay, significa que hay dígitos sin procesar en multiplicando
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
                        // Hay un dígito del multiplicador ya marcado,
                        // seguir procesando con el multiplicando
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
                    this.state = 'LIMPIEZA_FINAL';
                    this.logStep('No hay más dígitos 0/1 en multiplicador, iniciando limpieza final');
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
                    // No hay más dígitos en el multiplicando
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
                    this.state = 'AGREGAR_MULTIPLICACION';
                    this.logStep('Encontrado =, agregando resultado de multiplicación');
                } else if (symbol === '#') {
                    // Crear área de resultado
                    this.writeSymbol('=');
                    this.moveRight();
                    this.writeSymbol('#');
                    this.moveLeft();
                    this.state = 'AGREGAR_MULTIPLICACION';
                    this.logStep('Creado área de resultado =');
                } else {
                    this.moveRight();
                    this.logStep('Buscando área de resultado');
                }
                break;

            case 'AGREGAR_MULTIPLICACION':
                // Multiplicación: 0*0=0, 0*1=0, 1*0=0, 1*1=1
                let producto = (this.digit1 * this.digit2).toString();
                
                // Ir al final del área de resultado
                while (this.head < this.tape.length && this.getCurrentSymbol() !== '#' && this.getCurrentSymbol() !== '+') {
                    this.moveRight();
                }
                
                // Insertar el resultado
                this.tape.splice(this.head, 0, producto);
                this.logStep(`Multiplicación: ${this.digit1} × ${this.digit2} = ${producto}, agregado al resultado`);
                
                this.head = 0; // Regresar al inicio
                this.state = 'VERIFICAR_MAS_DIGITOS_MULTIPLICANDO';
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
                    // Hay más dígitos en multiplicando, continuar procesándolos
                    // NO pasar al siguiente dígito del multiplicador aún
                    this.state = 'INICIO';
                    this.logStep('Hay más dígitos 0/1 en multiplicando, continuando con el mismo dígito del multiplicador');
                } else {
                    // Multiplicando completamente procesado, ahora sí proceder con conversiones
                    this.state = 'CONVERTIR_LETRAS_MULTIPLICANDO';
                    this.logStep('Multiplicando completamente procesado (solo A/B), procediendo con conversiones');
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
                    this.state = 'LIMPIEZA_FINAL';
                    this.logStep('No hay más dígitos en multiplicador, iniciando limpieza final');
                }
                break;

            case 'AGREGAR_DESPLAZAMIENTO':
                // Ir al final y agregar + seguido de ceros
                this.head = this.tape.length - 1;
                if (this.getCurrentSymbol() === '#') {
                    this.writeSymbol('+');
                    this.moveRight();
                    
                    // Agregar ceros según el desplazamiento actual
                    // currentShift indica cuántos dígitos del multiplicador hemos procesado
                    for (let i = 0; i < this.currentShift; i++) {
                        this.tape.splice(this.head, 0, '0');
                    }
                    this.tape.push('#');
                    
                    this.currentShift++;
                    this.head = 0;
                    this.state = 'INICIO';
                    this.logStep(`Agregados ${this.currentShift - 1} ceros de desplazamiento, reiniciando ciclo`);
                } else {
                    this.moveRight();
                    this.logStep('Buscando final para agregar desplazamiento');
                }
                break;

            case 'LIMPIEZA_FINAL':
                this.logStep('Extrayendo y sumando resultados parciales');
                
                // Extraer todos los resultados parciales
                let resultadosP = [];
                let resultadoActual = '';
                let dentroDeResultado = false;
                
                for (let i = 0; i < this.tape.length; i++) {
                    if (this.tape[i] === '=') {
                        dentroDeResultado = true;
                        continue;
                    }
                    if (this.tape[i] === '+') {
                        if (resultadoActual) {
                            resultadosP.push(resultadoActual.split('').reverse().join(''));
                            resultadoActual = '';
                        }
                        continue;
                    }
                    if (this.tape[i] === '#') {
                        if (resultadoActual) {
                            resultadosP.push(resultadoActual.split('').reverse().join(''));
                        }
                        break;
                    }
                    if (dentroDeResultado && /[01]/.test(this.tape[i])) {
                        resultadoActual += this.tape[i];
                    }
                }
                
                // Sumar todos los resultados
                let resultadoFinal = '0';
                for (let resultado of resultadosP) {
                    if (resultado && resultado !== '0') {
                        resultadoFinal = this.addBinaryNumbers(resultadoFinal, resultado);
                    }
                }
                
                // Mostrar resultado final
                this.tape = ['#'];
                for (let digit of resultadoFinal) {
                    this.tape.push(digit);
                }
                this.tape.push('#');
                this.head = 1;
                this.state = 'COMPLETO';
                this.logStep(`Resultado final: ${resultadoFinal} (${this.num1} * ${this.num2} = ${resultadoFinal})`);
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