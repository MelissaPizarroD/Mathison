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

        // Inicializar cinta con formato correcto: #num1*num2#
        this.num1 = num1;
        this.num2 = num2;
        this.tape = ['#']; // Siempre empezar con #
        
        // Agregar primer número
        for (let digit of num1) {
            this.tape.push(digit);
        }
        
        this.tape.push('*');
        
        // Agregar segundo número
        for (let digit of num2) {
            this.tape.push(digit);
        }
        
        this.tape.push('#'); // Siempre terminar con #
        
        this.head = 0;
        this.stepCount = 0;
        this.steps = [];
        this.running = false;
        
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
                // Convertir A→0, B→1 paso a paso ANTES del *
                if (symbol === '*') {
                    // Llegamos al multiplicador, regresar al inicio orgánicamente
                    this.state = 'REGRESAR_PARA_MULTIPLICADOR';
                    this.logStep('Multiplicando convertido completamente, regresando al inicio para procesar multiplicador');
                } else if (symbol === 'A') {
                    this.writeSymbol('0');
                    this.moveRight();
                    this.logStep('Convertido A→0 en multiplicando');
                } else if (symbol === 'B') {
                    this.writeSymbol('1');
                    this.moveRight();
                    this.logStep('Convertido B→1 en multiplicando');
                } else {
                    this.moveRight();
                    this.logStep('Recorriendo multiplicando para conversiones');
                }
                break;

            case 'REGRESAR_PARA_MULTIPLICADOR':
                if (symbol === '#' && this.head === 0) {
                    this.moveRight();
                    this.state = 'CONVERTIR_LETRA_MULTIPLICADOR_A_X_Y';
                    this.logStep('Regresado al inicio, iniciando conversión del multiplicador');
                } else {
                    this.moveLeft();
                    this.logStep('Regresando al inicio orgánicamente para procesar multiplicador');
                }
                break;

            case 'CONVERTIR_LETRA_MULTIPLICADOR_A_X_Y':
                // Convertir A→X, B→Y paso a paso DESPUÉS del * y ANTES del =
                if (symbol === '=' || symbol === '+') {
                    // Llegamos al área de resultados, regresar al inicio orgánicamente
                    this.state = 'REGRESAR_PARA_VERIFICAR';
                    this.logStep('Multiplicador convertido completamente, regresando al inicio para verificar más dígitos');
                } else if (symbol === '*') {
                    // Encontramos el *, ahora procesar lo que sigue
                    this.moveRight();
                    this.logStep('Pasando el *, comenzando conversión del multiplicador');
                } else if (symbol === 'A') {
                    this.writeSymbol('X');
                    this.moveRight();
                    this.logStep('Convertido A→X en multiplicador');
                } else if (symbol === 'B') {
                    this.writeSymbol('Y');
                    this.moveRight();
                    this.logStep('Convertido B→Y en multiplicador');
                } else {
                    this.moveRight();
                    this.logStep('Recorriendo multiplicador para conversiones');
                }
                break;

            case 'REGRESAR_PARA_VERIFICAR':
                if (symbol === '#' && this.head === 0) {
                    this.moveRight();
                    this.state = 'VERIFICAR_MAS_DIGITOS_MULTIPLICADOR_REAL';
                    this.logStep('Regresado al inicio, verificando más dígitos');
                } else {
                    this.moveLeft();
                    this.logStep('Regresando al inicio orgánicamente para verificar más dígitos');
                }
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
                    // Encontramos el =, ahora buscar el final de los resultados
                    this.moveRight();
                    this.logStep('Encontrado =, buscando final de resultados para agregar +');
                } else if (symbol === '0' || symbol === '1') {
                    // Hay resultados, continuar buscando el final
                    this.moveRight();
                    this.logStep('Saltando dígito de resultado existente');
                } else if (symbol === '#') {
                    // Solo escribir + si estamos DESPUÉS del área de resultados
                    // Verificar que hay un = antes en la cinta
                    let hayIgualAntes = false;
                    for (let i = 0; i < this.head; i++) {
                        if (this.tape[i] === '=') {
                            hayIgualAntes = true;
                            break;
                        }
                    }
                    
                    if (hayIgualAntes) {
                        // Estamos al final de los resultados, escribir +
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
                    } else {
                        // Estamos en el # inicial, continuar buscando
                        this.moveRight();
                        this.logStep('En # inicial, continuando búsqueda del área de resultados');
                    }
                } else {
                    this.moveRight();
                    this.logStep('Buscando área de resultados para agregar desplazamiento');
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
                    this.state = 'LIMPIAR_ANTES_DE_IGUAL';
                    this.head = 0;
                    this.logStep('Solo quedan X/Y en multiplicador, comenzando limpieza orgánica hasta el =');
                } else {
                    this.state = 'INICIO';
                    this.logStep('Aún hay dígitos por procesar, continuando');
                }
                break;

            case 'LIMPIAR_ANTES_DE_IGUAL':
                if (symbol === '=') {
                    // Encontramos el =, también lo convertimos en #
                    this.writeSymbol('#');
                    this.moveRight();
                    this.state = 'COMPLETAR_LIMPIEZA';
                    this.logStep('Limpiado símbolo =, continuando limpieza hasta encontrar los resultados');
                } else if (symbol === '#') {
                    // Ya es #, solo continuar
                    this.moveRight();
                    this.logStep('Posición ya limpia, continuando');
                } else {
                    // Convertir cualquier otro símbolo en #
                    this.writeSymbol('#');
                    this.moveRight();
                    this.logStep(`Limpiando símbolo '${symbol}' → #`);
                }
                break;

            case 'COMPLETAR_LIMPIEZA':
                if (symbol === '0' || symbol === '1') {
                    // Encontramos los primeros resultados, finalizar limpieza y reorganizar cinta
                    this.logStep('Primeros resultados encontrados, reorganizando cinta final');
                    
                    // Extraer solo los resultados (números y +)
                    let resultados = [];
                    for (let i = this.head; i < this.tape.length; i++) {
                        if (this.tape[i] === '0' || this.tape[i] === '1' || this.tape[i] === '+') {
                            resultados.push(this.tape[i]);
                        } else if (this.tape[i] === '#' && resultados.length > 0) {
                            // Llegamos al final de los resultados
                            break;
                        }
                    }
                    
                    // Crear nueva cinta: # + resultados + #
                    this.tape = ['#'];
                    for (let simbolo of resultados) {
                        this.tape.push(simbolo);
                    }
                    this.tape.push('#');
                    
                    this.head = 1; // Posicionar en el primer resultado
                    this.state = 'COMPLETO';
                    this.logStep(`Limpieza completada. Cinta final: solo resultados entre ∅. Resultados: ${resultados.join('')}`);
                } else if (symbol === '#') {
                    // Continuar limpiando hasta encontrar resultados
                    this.moveRight();
                    this.logStep('Continuando limpieza hasta encontrar resultados');
                } else {
                    // Limpiar cualquier símbolo restante
                    this.writeSymbol('#');
                    this.moveRight();
                    this.logStep(`Limpiando símbolo restante '${symbol}' → #`);
                }
                break;

            case 'INVERTIR_RESULTADOS':
                this.logStep('Estado de inversión de resultados removido - usar limpieza orgánica');
                this.state = 'COMPLETO';
                break;

            case 'PREPARAR_SUMA':
                this.logStep('Estado de suma automática removido - los resultados están listos para suma manual');
                this.state = 'COMPLETO';
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