// js/operations/multiply.js
class MultiplyTuringMachine extends BaseTuringMachine {
    constructor() {
        super();
        this.digit1 = 0;
        this.digit2 = 0;
        this.processedDigitThisCycle = false;
        this.currentShift = 0;
        this.simboloParaEscribir = '';
        this.invertMachine = null; // Declarar la máquina de inversión
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
                if (symbol === '*') {
                    // Encontramos el *, ahora recorrer el multiplicador
                    this.moveRight();
                    this.state = 'ESCANEAR_MULTIPLICADOR_COMPLETO';
                    this.logStep('Encontrado *, comenzando escaneo completo del multiplicador');
                } else {
                    this.moveRight();
                    this.logStep('Buscando símbolo * para verificar multiplicador');
                }
                break;

            case 'ESCANEAR_MULTIPLICADOR_COMPLETO':
                if (symbol === '=' || symbol === '+') {
                    // Llegamos al final del multiplicador, regresar al inicio para decidir
                    this.state = 'REGRESAR_PARA_DECIDIR';
                    this.logStep('Escaneo del multiplicador completado, regresando para decidir siguiente acción');
                } else if (symbol === '0' || symbol === '1') {
                    // Aún hay dígitos sin procesar
                    this.state = 'REGRESAR_PARA_CONTINUAR';
                    this.logStep(`Encontrado dígito sin procesar '${symbol}', hay más trabajo por hacer`);
                } else {
                    this.moveRight();
                    this.logStep(`Escaneando multiplicador: '${symbol}'`);
                }
                break;

            case 'REGRESAR_PARA_DECIDIR':
                if (symbol === '#' && this.head === 0) {
                    this.moveRight();
                    this.state = 'BUSCAR_ASTERISCO_PARA_XY';
                    this.logStep('Regresado al inicio, verificando si solo quedan X/Y');
                } else {
                    this.moveLeft();
                    this.logStep('Regresando al inicio para decidir siguiente acción');
                }
                break;

            case 'REGRESAR_PARA_CONTINUAR':
                if (symbol === '#' && this.head === 0) {
                    this.moveRight();
                    this.state = 'AGREGAR_DESPLAZAMIENTO';
                    this.logStep('Regresado al inicio, continuando con desplazamiento');
                } else {
                    this.moveLeft();
                    this.logStep('Regresando al inicio para continuar procesamiento');
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
                    // Estamos al final de los resultados, escribir + y AGREGAR CERO INMEDIATAMENTE
                    this.writeSymbol('+');
                    this.moveRight();
                    this.writeSymbol('0'); // ← CERO AUTOMÁTICO DE DESPLAZAMIENTO
                    this.moveRight();
                    this.writeSymbol('#');
                    this.currentShift++; // Incrementar para el próximo ciclo
                    this.state = 'REGRESAR_AL_INICIO';
                    this.logStep(`✅ Agregado + con cero automático de desplazamiento (posición ${this.currentShift})`);
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
                // Primero regresar al inicio si no estamos ahí
                if (symbol === '#' && this.head === 0) {
                    this.moveRight();
                    this.state = 'BUSCAR_ASTERISCO_PARA_XY';
                    this.logStep('En el inicio, comenzando búsqueda de * para verificar X/Y');
                } else {
                    this.moveLeft();
                    this.logStep('Regresando al inicio para verificar si solo quedan X/Y');
                }
                break;

            case 'BUSCAR_ASTERISCO_PARA_XY':
                if (symbol === '*') {
                    // Encontramos el *, comenzar verificación del multiplicador
                    this.moveRight();
                    this.state = 'ESCANEAR_SOLO_XY';
                    this.logStep('Encontrado *, verificando si multiplicador solo tiene X/Y');
                } else {
                    this.moveRight();
                    this.logStep('Buscando * para verificar multiplicador');
                }
                break;

            case 'ESCANEAR_SOLO_XY':
                if (symbol === '=' || symbol === '+') {
                    // Llegamos al final sin encontrar 0s o 1s, solo hay X/Y
                    this.state = 'REGRESAR_PARA_LIMPIAR';
                    this.logStep('Solo encontré X/Y en multiplicador, comenzando limpieza');
                } else if (symbol === '0' || symbol === '1') {
                    // Encontramos un dígito, aún hay trabajo por hacer
                    this.state = 'REGRESAR_PARA_CONTINUAR';
                    this.logStep(`Encontrado dígito '${symbol}', aún hay dígitos por procesar`);
                } else if (symbol === 'X' || symbol === 'Y') {
                    // Son X/Y, continuar escaneando
                    this.moveRight();
                    this.logStep(`Verificando: '${symbol}' (procesado)`);
                } else {
                    this.moveRight();
                    this.logStep(`Escaneando: '${symbol}'`);
                }
                break;

            case 'REGRESAR_PARA_LIMPIAR':
                if (symbol === '#' && this.head === 0) {
                    this.moveRight();
                    this.state = 'LIMPIAR_ANTES_DE_IGUAL';
                    this.logStep('Regresado al inicio, comenzando limpieza orgánica');
                } else {
                    this.moveLeft();
                    this.logStep('Regresando al inicio para comenzar limpieza');
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
                    // Encontramos los primeros resultados, extraer toda la secuencia
                    this.logStep('Primeros resultados encontrados, extrayendo para inversión automática');
                    
                    // Extraer todos los resultados válidos desde la posición actual hasta el final
                    let resultados = [];
                    for (let i = this.head; i < this.tape.length; i++) {
                        let sym = this.tape[i];
                        // Solo agregar símbolos válidos (0, 1, +), ignorar espacios vacíos y #
                        if (sym === '0' || sym === '1' || sym === '+') {
                            resultados.push(sym);
                        } else if (sym === '#') {
                            // Llegamos al final
                            break;
                        }
                        // Ignorar cualquier otro símbolo (espacios vacíos, etc.)
                    }
                    
                    // Verificar que tenemos una estructura válida número+número
                    let expresionSuma = resultados.join('');
                    this.logStep(`Secuencia extraída (limpia): "${expresionSuma}"`);
                    
                    if (expresionSuma.includes('+') && expresionSuma.length > 2) {
                        // Verificar que InvertSumTuringMachine existe
                        if (typeof InvertSumTuringMachine !== 'undefined') {
                            // Crear instancia de la máquina de inversión
                            this.invertMachine = new InvertSumTuringMachine();
                            if (this.invertMachine.initialize(expresionSuma)) {
                                // Sincronizar cinta inicial para visualización
                                this.tape = [...this.invertMachine.tape];
                                this.head = this.invertMachine.head;
                                
                                this.state = 'EJECUTAR_INVERSION_AUTOMATICA';
                                this.logStep(`Iniciando inversión automática de: ${expresionSuma}`);
                                this.logStep(`Cinta de inversión sincronizada: [${this.tape.join(', ')}]`);
                                this.logStep(`Cabezal en posición: ${this.head}`);
                            } else {
                                this.state = 'COMPLETO';
                                this.logStep('Error al inicializar máquina de inversión');
                            }
                        } else {
                            this.logStep('⚠️ InvertSumTuringMachine no está disponible. Asegúrate de que invert.js esté cargado.');
                            this.state = 'COMPLETO';
                        }
                    } else {
                        // No hay estructura válida para invertir
                        this.logStep(`Estructura no válida para inversión: "${expresionSuma}"`);
                        this.state = 'COMPLETO';
                    }
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

            case 'EJECUTAR_INVERSION_AUTOMATICA':
                // Ejecutar un paso de la máquina de inversión
                if (this.invertMachine && this.invertMachine.executeStep()) {
                    // La máquina de inversión sigue ejecutándose
                    // Sincronizar nuestra cinta con la de la máquina de inversión para la visualización
                    this.tape = [...this.invertMachine.tape]; // Copiar la cinta actual
                    this.head = this.invertMachine.head; // Sincronizar posición del cabezal
                    
                    // Mostrar el progreso de la inversión
                    this.logStep(`[INVERSIÓN] ${this.invertMachine.state}`);
                } else {
                    // La máquina de inversión terminó
                    if (this.invertMachine && this.invertMachine.state === 'COMPLETO') {
                        // Copiar el resultado final de la máquina de inversión
                        this.tape = [...this.invertMachine.tape];
                        this.head = this.invertMachine.head;
                        
                        // Extraer el resultado final para mostrarlo
                        let resultadoFinal = '';
                        for (let i = 1; i < this.tape.length - 1; i++) {
                            if (this.tape[i] && (this.tape[i] === '0' || this.tape[i] === '1' || this.tape[i] === '+')) {
                                resultadoFinal += this.tape[i];
                            }
                        }
                        
                        this.logStep(`Inversión automática completada. Resultado: ${resultadoFinal}`);
                        this.logStep('Números invertidos correctamente según algoritmo especificado');
                    } else {
                        this.logStep('Máquina de inversión terminó con estado no esperado');
                    }
                    this.state = 'COMPLETO';
                }
                break;

            case 'INICIAR_INVERSION_AUTO':
                // Empezar desde el inicio para procesar el primer número
                if (symbol === '#' && this.head === 0) {
                    this.moveRight();
                    this.state = 'BUSCAR_PRIMER_NUMERO';
                    this.logStep('Iniciando inversión, buscando primer número');
                } else {
                    this.head = 0;
                    this.logStep('Posicionándose al inicio para inversión');
                }
                break;

            case 'BUSCAR_PRIMER_NUMERO':
                if (symbol === '0' || symbol === '1') {
                    this.state = 'BUSCAR_FINAL_PRIMER_NUMERO';
                    this.logStep('Encontrado primer número, buscando su final');
                } else {
                    this.moveRight();
                    this.logStep('Buscando inicio del primer número');
                }
                break;

            case 'BUSCAR_FINAL_PRIMER_NUMERO':
                if (symbol === '+') {
                    // Encontramos el final del primer número
                    this.moveLeft();
                    this.state = 'INVERTIR_PRIMER_NUMERO';
                    this.logStep('Encontrado final del primer número, comenzando inversión');
                } else {
                    this.moveRight();
                    this.logStep('Buscando final del primer número');
                }
                break;

            case 'INVERTIR_PRIMER_NUMERO':
                if (symbol === '0' || symbol === '1') {
                    // Marcar y procesar dígito del primer número
                    this.simboloParaEscribir = symbol;
                    this.writeSymbol('X');
                    this.moveLeft();
                    this.state = 'BUSCAR_INICIO_PRIMER_NUMERO';
                    this.logStep(`Marcado dígito ${symbol} del primer número como X`);
                } else if (symbol === 'X') {
                    // Dígito ya procesado
                    this.moveLeft();
                    this.logStep('Dígito ya procesado en primer número');
                } else if (symbol === '#') {
                    // Terminamos el primer número, ahora procesar el segundo
                    this.head = 0;
                    this.state = 'SEGUNDO_NUMERO';
                    this.logStep('Primer número completado, iniciando segundo número');
                } else {
                    this.moveLeft();
                    this.logStep('Continuando hacia el inicio del primer número');
                }
                break;

            case 'BUSCAR_INICIO_PRIMER_NUMERO':
                if (symbol === '#') {
                    this.moveRight();
                    this.state = 'ESCRIBIR_DIGITO_PRIMER_NUMERO';
                    this.logStep('Encontrado inicio, escribiendo dígito del primer número');
                } else {
                    this.moveLeft();
                    this.logStep('Buscando inicio para escribir dígito del primer número');
                }
                break;

            case 'ESCRIBIR_DIGITO_PRIMER_NUMERO':
                if (symbol === 'Y') {
                    // Espacio marcado para escribir
                    this.writeSymbol(this.simboloParaEscribir);
                    this.moveRight();
                    this.state = 'REGRESAR_A_X_PRIMER_NUMERO';
                    this.logStep(`Escrito ${this.simboloParaEscribir} en primer número`);
                } else if (symbol === 'X' || symbol === '+' || symbol === '0' || symbol === '1' || symbol === '#') {
                    // Marcar espacio y retroceder
                    this.writeSymbol('Y');
                    this.moveLeft();
                    this.logStep('Marcando espacio Y en primer número');
                } else {
                    this.moveRight();
                    this.logStep('Buscando posición para escribir en primer número');
                }
                break;

            case 'REGRESAR_A_X_PRIMER_NUMERO':
                if (symbol === 'X') {
                    // Encontrar la X y continuar procesando
                    this.writeSymbol(this.simboloParaEscribir);
                    this.moveLeft();
                    this.state = 'INVERTIR_PRIMER_NUMERO';
                    this.logStep('X encontrada y restaurada en primer número');
                } else {
                    this.moveRight();
                    this.logStep('Buscando X en primer número');
                }
                break;

            case 'SEGUNDO_NUMERO':
                // Empezar procesamiento del segundo número
                if (symbol === '+') {
                    this.moveRight();
                    this.state = 'BUSCAR_FINAL_SEGUNDO_NUMERO';
                    this.logStep('Encontrado +, buscando final del segundo número');
                } else {
                    this.moveRight();
                    this.logStep('Buscando separador + para segundo número');
                }
                break;

            case 'BUSCAR_FINAL_SEGUNDO_NUMERO':
                if (symbol === '#') {
                    this.moveLeft();
                    this.state = 'INVERTIR_SEGUNDO_NUMERO';
                    this.logStep('Encontrado final del segundo número, comenzando inversión');
                } else {
                    this.moveRight();
                    this.logStep('Buscando final del segundo número');
                }
                break;

            case 'INVERTIR_SEGUNDO_NUMERO':
                if (symbol === '0' || symbol === '1') {
                    // Marcar y procesar dígito del segundo número
                    this.simboloParaEscribir = symbol;
                    this.writeSymbol('X');
                    this.moveLeft();
                    this.state = 'BUSCAR_PLUS_SEGUNDO_NUMERO';
                    this.logStep(`Marcado dígito ${symbol} del segundo número como X`);
                } else if (symbol === 'X') {
                    // Dígito ya procesado
                    this.moveLeft();
                    this.logStep('Dígito ya procesado en segundo número');
                } else if (symbol === '+') {
                    // Terminamos el segundo número, comenzar limpieza
                    this.head = 0;
                    this.state = 'LIMPIAR_MARCADORES_INVERSION';
                    this.logStep('Segundo número completado, iniciando limpieza final');
                } else {
                    this.moveLeft();
                    this.logStep('Continuando hacia el + del segundo número');
                }
                break;

            case 'BUSCAR_PLUS_SEGUNDO_NUMERO':
                if (symbol === '+') {
                    this.moveRight();
                    this.state = 'ESCRIBIR_DIGITO_SEGUNDO_NUMERO';
                    this.logStep('Encontrado +, escribiendo dígito del segundo número');
                } else {
                    this.moveLeft();
                    this.logStep('Buscando + para escribir dígito del segundo número');
                }
                break;

            case 'ESCRIBIR_DIGITO_SEGUNDO_NUMERO':
                if (symbol === 'Z') {
                    // Espacio marcado para escribir
                    this.writeSymbol(this.simboloParaEscribir);
                    this.moveRight();
                    this.state = 'REGRESAR_A_X_SEGUNDO_NUMERO';
                    this.logStep(`Escrito ${this.simboloParaEscribir} en segundo número`);
                } else if (symbol === 'X' || symbol === '#' || symbol === '0' || symbol === '1') {
                    // Marcar espacio y retroceder
                    this.writeSymbol('Z');
                    this.moveLeft();
                    this.logStep('Marcando espacio Z en segundo número');
                } else {
                    this.moveRight();
                    this.logStep('Buscando posición para escribir en segundo número');
                }
                break;

            case 'REGRESAR_A_X_SEGUNDO_NUMERO':
                if (symbol === 'X') {
                    // Encontrar la X y continuar procesando
                    this.writeSymbol(this.simboloParaEscribir);
                    this.moveLeft();
                    this.state = 'INVERTIR_SEGUNDO_NUMERO';
                    this.logStep('X encontrada y restaurada en segundo número');
                } else {
                    this.moveRight();
                    this.logStep('Buscando X en segundo número');
                }
                break;

            case 'LIMPIAR_MARCADORES_INVERSION':
                if (symbol === 'X') {
                    this.writeSymbol('#');
                    this.moveRight();
                    this.logStep('Limpiando marcador X de inversión');
                } else if (symbol === 'Y') {
                    this.writeSymbol('#');
                    this.moveRight();
                    this.logStep('Limpiando marcador Y de inversión');
                } else if (symbol === 'Z') {
                    this.writeSymbol('#');
                    this.moveRight();
                    this.logStep('Limpiando marcador Z de inversión');
                } else if (symbol === '#') {
                    // Verificar si hemos terminado la limpieza
                    let hayMasMarcadores = false;
                    for (let i = 0; i < this.tape.length; i++) {
                        if (this.tape[i] === 'X' || this.tape[i] === 'Y' || this.tape[i] === 'Z') {
                            hayMasMarcadores = true;
                            break;
                        }
                    }
                    if (!hayMasMarcadores) {
                        // Reorganizar cinta final manteniendo estructura número+número
                        this.reorganizarCintaConSeparador();
                        this.state = 'COMPLETO';
                        this.logStep('Inversión completada - números invertidos con separador preservado');
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
                this.logStep('¡Multiplicación binaria con inversión automática completa!');
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

    // Método para reorganizar la cinta final preservando la estructura número+número
    reorganizarCintaConSeparador() {
        let nuevaCinta = ['#'];
        let primerNumero = '';
        let segundoNumero = '';
        let enSegundoNumero = false;
        
        // Extraer números válidos preservando la estructura
        for (let i = 1; i < this.tape.length - 1; i++) {
            if (this.tape[i] === '+') {
                enSegundoNumero = true;
            } else if (this.tape[i] === '0' || this.tape[i] === '1') {
                if (enSegundoNumero) {
                    segundoNumero += this.tape[i];
                } else {
                    primerNumero += this.tape[i];
                }
            }
        }
        
        // Reconstruir cinta con estructura número+número
        for (let char of primerNumero) {
            nuevaCinta.push(char);
        }
        nuevaCinta.push('+');
        for (let char of segundoNumero) {
            nuevaCinta.push(char);
        }
        nuevaCinta.push('#');
        
        this.tape = nuevaCinta;
        this.head = 1;
        this.logStep(`Cinta reorganizada: ${primerNumero}+${segundoNumero} - números invertidos con separador preservado`);
    }
}