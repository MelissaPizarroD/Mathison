/**
 * Parser mejorado para expresiones binarias con máquinas de Turing REALES
 * Optimizado para trabajar con implementaciones auténticas
 */

class ExpressionParser {
    
    /**
     * Tokeniza una expresión en números y operadores
     * @param {string} expression - Expresión a tokenizar
     * @returns {Array} Array de tokens
     */
    static tokenize(expression) {
        const originalExpression = expression;
        expression = expression.replace(/\s+/g, '');
        
        // Validación inicial de caracteres
        const validChars = /^[01+\-*xX\/÷()]*$/;
        if (!validChars.test(expression)) {
            const invalidChar = expression.match(/[^01+\-*xX\/÷()]/)[0];
            throw new Error(`Carácter no válido encontrado: '${invalidChar}'. Solo se permiten dígitos binarios (0,1) y operadores (+,-,*,/,x,÷)`);
        }
        
        const tokens = [];
        let currentNumber = '';
        
        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];
            
            if (char === '0' || char === '1') {
                currentNumber += char;
            } else if (['+', '-', '*', 'x', 'X', '/', '÷'].includes(char)) {
                if (currentNumber) {
                    tokens.push({ type: 'number', value: currentNumber });
                    currentNumber = '';
                }
                
                // Normalizar operadores
                let operator = char;
                if (char === 'x' || char === 'X') operator = '*';
                if (char === '÷') operator = '/';
                
                tokens.push({ type: 'operator', value: operator });
            } else if (char === '(' || char === ')') {
                if (currentNumber) {
                    tokens.push({ type: 'number', value: currentNumber });
                    currentNumber = '';
                }
                tokens.push({ type: 'parenthesis', value: char });
            }
        }
        
        if (currentNumber) {
            tokens.push({ type: 'number', value: currentNumber });
        }
        
        return tokens;
    }
    
    /**
     * Valida que un número sea binario válido
     * @param {string} number - Número a validar
     * @returns {boolean} true si es válido
     */
    static isValidBinary(number) {
        return /^[01]+$/.test(number);
    }
    
    /**
     * Valida que los tokens sean correctos
     * @param {Array} tokens - Tokens a validar
     * @returns {Object} Resultado de validación
     */
    static validateTokens(tokens) {
        if (tokens.length === 0) {
            return { valid: false, error: 'Expresión vacía. Ingresa una expresión binaria como "101 + 110"' };
        }
        
        // Verificar que todos los números sean binarios válidos
        for (const token of tokens) {
            if (token.type === 'number' && !this.isValidBinary(token.value)) {
                return { 
                    valid: false, 
                    error: `Número binario no válido: "${token.value}". Solo usa dígitos 0 y 1` 
                };
            }
        }
        
        // Verificar balance de paréntesis
        const parenthesisCheck = this.validateParentheses(tokens);
        if (!parenthesisCheck.valid) {
            return parenthesisCheck;
        }
        
        // Verificar estructura general
        const structureCheck = this.validateStructure(tokens);
        if (!structureCheck.valid) {
            return structureCheck;
        }
        
        // Verificar que no sea solo un número
        const numberCount = tokens.filter(t => t.type === 'number').length;
        const operatorCount = tokens.filter(t => t.type === 'operator').length;
        
        if (numberCount === 1 && operatorCount === 0) {
            return {
                valid: false,
                error: `Solo hay un número (${tokens.find(t => t.type === 'number').value}). Agrega al menos una operación como "+ 110"`
            };
        }
        
        if (operatorCount === 0) {
            return {
                valid: false,
                error: 'No hay operaciones. Agrega operadores como +, -, *, /'
            };
        }
        
        return { valid: true };
    }
    
    /**
     * Valida el balance y posición de paréntesis
     * @param {Array} tokens - Tokens a validar
     * @returns {Object} Resultado de validación
     */
    static validateParentheses(tokens) {
        let depth = 0;
        let openPositions = [];
        
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            
            if (token.type === 'parenthesis') {
                if (token.value === '(') {
                    depth++;
                    openPositions.push(i);
                    
                    if (i + 1 < tokens.length) {
                        const nextToken = tokens[i + 1];
                        if (nextToken.type === 'operator') {
                            return {
                                valid: false,
                                error: `No puede haber un operador "${nextToken.value}" inmediatamente después de '('`
                            };
                        }
                    }
                } else if (token.value === ')') {
                    depth--;
                    
                    if (depth < 0) {
                        return {
                            valid: false,
                            error: `Paréntesis de cierre ')' sin paréntesis de apertura correspondiente en posición ${i + 1}`
                        };
                    }
                    
                    if (i > 0) {
                        const prevToken = tokens[i - 1];
                        if (prevToken.type === 'operator') {
                            return {
                                valid: false,
                                error: `No puede haber un operador "${prevToken.value}" inmediatamente antes de ')'`
                            };
                        }
                    }
                    
                    openPositions.pop();
                }
            }
        }
        
        if (depth > 0) {
            return {
                valid: false,
                error: `Paréntesis sin cerrar. Faltan ${depth} paréntesis de cierre ')'`
            };
        }
        
        return { valid: true };
    }
    
    /**
     * Valida la estructura general de la expresión
     * @param {Array} tokens - Tokens a validar
     * @returns {Object} Resultado de validación
     */
    static validateStructure(tokens) {
        const nonParenTokens = tokens.filter(t => t.type !== 'parenthesis');
        if (nonParenTokens.length === 0) {
            return {
                valid: false,
                error: 'Solo hay paréntesis vacíos. Agrega números y operadores'
            };
        }
        
        for (let i = 0; i < tokens.length; i++) {
            const current = tokens[i];
            const prev = i > 0 ? tokens[i - 1] : null;
            const next = i < tokens.length - 1 ? tokens[i + 1] : null;
            
            if (current.type === 'number') {
                if (prev && prev.type !== 'parenthesis' && prev.type !== 'operator') {
                    return {
                        valid: false,
                        error: `Número "${current.value}" en posición incorrecta. No puede estar después de "${prev.value}"`
                    };
                }
                
                if (next && next.type !== 'parenthesis' && next.type !== 'operator') {
                    return {
                        valid: false,
                        error: `Número "${current.value}" seguido de "${next.value}". Debe haber un operador entre números`
                    };
                }
                
            } else if (current.type === 'operator') {
                if (!prev || (prev.type !== 'number' && prev.value !== ')')) {
                    return {
                        valid: false,
                        error: `Operador "${current.value}" no puede estar al inicio o después de "${prev ? prev.value : 'nada'}"`
                    };
                }
                
                if (!next || (next.type !== 'number' && next.value !== '(')) {
                    return {
                        valid: false,
                        error: `Operador "${current.value}" debe ser seguido por un número o '('`
                    };
                }
            }
        }
        
        const lastToken = tokens[tokens.length - 1];
        if (lastToken.type === 'operator') {
            return {
                valid: false,
                error: `Expresión incompleta: termina con operador "${lastToken.value}". Agrega un número al final`
            };
        }
        
        const firstToken = tokens[0];
        if (firstToken.type === 'operator') {
            return {
                valid: false,
                error: `No puede comenzar con operador "${firstToken.value}". Debe empezar con un número o '('`
            };
        }
        
        return { valid: true };
    }
    
    /**
     * Convierte tokens a formato postfijo (notación polaca inversa)
     * @param {Array} tokens - Tokens en notación infija
     * @returns {Array} Tokens en notación postfija
     */
    static toPostfix(tokens) {
        const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
        const output = [];
        const operators = [];
        
        for (const token of tokens) {
            if (token.type === 'number') {
                output.push(token);
            } else if (token.type === 'operator') {
                while (
                    operators.length > 0 &&
                    operators[operators.length - 1].type === 'operator' &&
                    precedence[operators[operators.length - 1].value] >= precedence[token.value]
                ) {
                    output.push(operators.pop());
                }
                operators.push(token);
            } else if (token.value === '(') {
                operators.push(token);
            } else if (token.value === ')') {
                while (
                    operators.length > 0 &&
                    operators[operators.length - 1].value !== '('
                ) {
                    output.push(operators.pop());
                }
                if (operators.length > 0) {
                    operators.pop(); // Remover el '('
                }
            }
        }
        
        while (operators.length > 0) {
            output.push(operators.pop());
        }
        
        return output;
    }
    
    /**
     * Evalúa una expresión en notación postfija usando máquinas de Turing REALES
     * @param {Array} postfixTokens - Tokens en notación postfija
     * @returns {Object} Resultado con pasos de ejecución
     */
    static evaluatePostfix(postfixTokens) {
        const stack = [];
        const steps = [];
        const machines = [];
        
        console.log(`🔧 Evaluando expresión postfija:`, postfixTokens.map(t => t.value).join(' '));
        
        for (const token of postfixTokens) {
            if (token.type === 'number') {
                stack.push(token.value);
                steps.push({
                    action: 'push',
                    value: token.value,
                    stack: [...stack],
                    description: `Apilar número: ${token.value}`
                });
            } else if (token.type === 'operator') {
                if (stack.length < 2) {
                    throw new Error('Expresión mal formada: faltan operandos');
                }
                
                const b = stack.pop();
                const a = stack.pop();
                
                console.log(`🤖 Ejecutando operación: ${a} ${token.value} ${b}`);
                
                steps.push({
                    action: 'operation',
                    operator: token.value,
                    operands: [a, b],
                    description: `Ejecutando máquina de Turing para: ${a} ${token.value} ${b}`
                });
                
                // EJECUTAR LA MÁQUINA DE TURING REAL
                try {
                    const operation = BinaryOperations.executeOperation(a, token.value, b);
                    
                    machines.push({
                        operation: `${a} ${token.value} ${b}`,
                        machine: operation.machine,
                        result: operation.result,
                        success: operation.success !== false,
                        error: operation.error
                    });
                    
                    if (operation.result.binary === 'ERROR') {
                        throw new Error(`Error en operación: ${a} ${token.value} ${b}`);
                    }
                    
                    const resultBinary = operation.result.binary;
                    stack.push(resultBinary);
                    
                    steps.push({
                        action: 'result',
                        value: resultBinary,
                        stack: [...stack],
                        description: `Máquina completada: ${resultBinary} (${operation.result.decimal})`
                    });
                    
                    console.log(`✅ Resultado: ${resultBinary} (${operation.result.decimal})`);
                    
                } catch (error) {
                    console.error(`❌ Error en máquina de Turing:`, error);
                    
                    // Crear máquina de respaldo con error
                    const fallbackMachine = new TuringMachine();
                    fallbackMachine.initializeTape('ERROR');
                    fallbackMachine.saveState(`Error: ${error.message}`, 'ERROR');
                    
                    machines.push({
                        operation: `${a} ${token.value} ${b}`,
                        machine: fallbackMachine,
                        result: { binary: 'ERROR', decimal: 'ERROR' },
                        success: false,
                        error: error.message
                    });
                    
                    throw error;
                }
            }
        }
        
        if (stack.length !== 1) {
            throw new Error('Expresión mal formada: resultado ambiguo');
        }
        
        const finalResult = stack[0];
        const decimal = finalResult.startsWith('-') ? 
            -parseInt(finalResult.substring(1), 2) : 
            parseInt(finalResult, 2);
        
        return {
            result: {
                binary: finalResult,
                decimal: decimal.toString()
            },
            steps: steps,
            machines: machines
        };
    }
    
    /**
     * Evalúa una expresión binaria completa usando máquinas de Turing REALES
     * @param {string} expression - Expresión a evaluar
     * @returns {Object} Resultado completo con máquinas y pasos
     */
    static evaluate(expression) {
        const startTime = Date.now();
        
        try {
            console.log(`🚀 Iniciando evaluación de expresión: "${expression}"`);
            
            // 1. Tokenizar
            const tokens = this.tokenize(expression);
            console.log(`📝 Tokens:`, tokens);
            
            // 2. Validar
            const validation = this.validateTokens(tokens);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            
            // 3. Convertir a notación postfija
            const postfixTokens = this.toPostfix(tokens);
            console.log(`📐 Notación postfija:`, postfixTokens.map(t => t.value).join(' '));
            
            // 4. Evaluar usando máquinas de Turing REALES
            const evaluation = this.evaluatePostfix(postfixTokens);
            
            const endTime = Date.now();
            console.log(`✅ Evaluación completada en ${endTime - startTime}ms`);
            
            return {
                success: true,
                expression: expression,
                tokens: tokens,
                postfix: postfixTokens,
                result: evaluation.result,
                steps: evaluation.steps,
                machines: evaluation.machines,
                startTime: startTime,
                endTime: endTime,
                executionTime: endTime - startTime
            };
            
        } catch (error) {
            console.error(`❌ Error en evaluación:`, error);
            
            return {
                success: false,
                error: error.message,
                expression: expression,
                startTime: startTime,
                endTime: Date.now()
            };
        }
    }
    
    /**
     * Obtiene ejemplos optimizados para máquinas de Turing reales
     * @returns {Array} Array de ejemplos organizados por complejidad
     */
    static getExamples() {
        return {
            // Ejemplos para máquinas reales simples
            simple: [
                '1 + 0',      // Máquina real de 5 estados
                '1 + 1',      // Máquina real con acarreo
                '10 + 01',    // Procesamiento multi-dígito básico
                '11 + 10',    // Suma con resultado de 3 dígitos
                '1 - 1',      // Resta simple
                '10 - 1'      // Resta con préstamo
            ],
            
            // Ejemplos para algoritmos complejos pero funcionales
            medium: [
                '101 + 110',     // Suma con representación unaria
                '1010 - 11',     // Resta por complemento
                '11 * 10',       // Multiplicación por sumas
                '1100 / 11',     // División por restas
                '100 + 11 + 10', // Múltiples sumas
                '1000 - 101 - 10' // Múltiples restas
            ],
            
            // Ejemplos con paréntesis para múltiples máquinas
            complex: [
                '(1 + 1) * 10',          // Resultado de máquina real usado en siguiente
                '11 + (100 - 10)',       // Operación anidada
                '(10 + 11) * (11 - 1)',  // Múltiples grupos
                '((1 + 1) + 10) * 1',    // Paréntesis anidados
                '(101 + 110) - (11 * 10)', // Operaciones mixtas
                '1010 / (11 + 1)'        // División con operación en denominador
            ]
        };
    }
    
    /**
     * Obtiene un ejemplo aleatorio según la complejidad deseada
     * @param {string} complexity - 'simple', 'medium', 'complex', o 'any'
     * @returns {string} Ejemplo aleatorio
     */
    static getRandomExample(complexity = 'any') {
        const examples = this.getExamples();
        
        let sourceArray;
        switch (complexity) {
            case 'simple':
                sourceArray = examples.simple;
                break;
            case 'medium':
                sourceArray = examples.medium;
                break;
            case 'complex':
                sourceArray = examples.complex;
                break;
            default:
                sourceArray = [...examples.simple, ...examples.medium, ...examples.complex];
        }
        
        return sourceArray[Math.floor(Math.random() * sourceArray.length)];
    }
    
    /**
     * Genera una expresión aleatoria optimizada para máquinas de Turing
     * @param {string} complexity - Nivel de complejidad deseado
     * @returns {string} Expresión generada
     */
    static generateRandomExpression(complexity = 'medium') {
        if (complexity === 'simple') {
            // Para máquinas reales simples
            const operators = ['+', '-'];
            const numbers = ['0', '1', '10', '11', '100', '101'];
            
            const a = numbers[Math.floor(Math.random() * numbers.length)];
            const operator = operators[Math.floor(Math.random() * operators.length)];
            const b = numbers[Math.floor(Math.random() * numbers.length)];
            
            return `${a} ${operator} ${b}`;
        }
        
        if (complexity === 'complex') {
            // Para múltiples máquinas
            const simpleExpr1 = this.generateRandomExpression('simple');
            const simpleExpr2 = this.generateRandomExpression('simple');
            const operators = ['+', '-', '*', '/'];
            const operator = operators[Math.floor(Math.random() * operators.length)];
            
            return `(${simpleExpr1}) ${operator} (${simpleExpr2})`;
        }
        
        // Complejidad media
        const operators = ['+', '-', '*', '/'];
        const maxBits = 4;
        const numCount = 2 + Math.floor(Math.random() * 2);
        const numbers = [];
        
        for (let i = 0; i < numCount; i++) {
            const bits = 1 + Math.floor(Math.random() * maxBits);
            let number = '';
            for (let j = 0; j < bits; j++) {
                number += Math.floor(Math.random() * 2);
            }
            if (number.length > 1 && number[0] === '0') {
                number = '1' + number.substring(1);
            }
            numbers.push(number);
        }
        
        let expression = numbers[0];
        for (let i = 1; i < numbers.length; i++) {
            const operator = operators[Math.floor(Math.random() * operators.length)];
            expression += ` ${operator} ${numbers[i]}`;
        }
        
        return expression;
    }
    
    /**
     * Intenta corregir automáticamente errores comunes
     * @param {string} expression - Expresión con posibles errores
     * @returns {Object} Resultado con corrección sugerida
     */
    static suggestCorrection(expression) {
        const original = expression;
        let corrected = expression;
        const corrections = [];
        
        // Limpiar espacios excesivos
        if (corrected.includes('  ')) {
            corrected = corrected.replace(/\s+/g, ' ');
            corrections.push('Espacios excesivos removidos');
        }
        
        // Corregir operadores dobles comunes
        const doubleOperators = [
            { pattern: /\+\+/g, replacement: '+', desc: 'Operador ++ corregido a +' },
            { pattern: /--/g, replacement: '-', desc: 'Operador -- corregido a -' },
            { pattern: /\*\*/g, replacement: '*', desc: 'Operador ** corregido a *' },
            { pattern: /\/\//g, replacement: '/', desc: 'Operador // corregido a /' },
            { pattern: /xx/gi, replacement: '*', desc: 'Operador xx corregido a *' }
        ];
        
        doubleOperators.forEach(({ pattern, replacement, desc }) => {
            if (pattern.test(corrected)) {
                corrected = corrected.replace(pattern, replacement);
                corrections.push(desc);
            }
        });
        
        // Balancear paréntesis
        const openCount = (corrected.match(/\(/g) || []).length;
        const closeCount = (corrected.match(/\)/g) || []).length;
        
        if (openCount > closeCount) {
            const missing = openCount - closeCount;
            corrected += ')'.repeat(missing);
            corrections.push(`${missing} paréntesis de cierre agregados`);
        } else if (closeCount > openCount) {
            const missing = closeCount - openCount;
            corrected = '('.repeat(missing) + corrected;
            corrections.push(`${missing} paréntesis de apertura agregados`);
        }
        
        // Multiplicación implícita entre paréntesis
        const beforeMult = corrected;
        corrected = corrected.replace(/\)\s*\(/g, ')*(');
        if (corrected !== beforeMult) {
            corrections.push('Multiplicación implícita entre paréntesis agregada');
        }
        
        // Convertir números decimales pequeños a binario
        corrected = corrected.replace(/\d+/g, (match) => {
            if (!/^[01]+$/.test(match)) {
                const decimal = parseInt(match, 10);
                if (!isNaN(decimal) && decimal >= 0 && decimal <= 255) {
                    const binary = decimal.toString(2);
                    corrections.push(`Número ${match} convertido a binario: ${binary}`);
                    return binary;
                }
            }
            return match;
        });
        
        // Remover caracteres inválidos
        const beforeClean = corrected;
        corrected = corrected.replace(/[^01+\-*\/xX÷\s()]/g, '');
        if (beforeClean !== corrected) {
            corrections.push('Caracteres inválidos removidos');
        }
        
        corrected = corrected.trim();
        
        return {
            hasCorrections: corrections.length > 0,
            original: original,
            corrected: corrected,
            corrections: corrections,
            suggestion: corrections.length > 0 ? 
                `¿Quisiste decir: "${corrected}"?` : 
                null
        };
    }
    
    /**
     * Valida y sugiere correcciones para una expresión
     * @param {string} expression - Expresión a validar
     * @returns {Object} Resultado completo de validación
     */
    static validateExpression(expression) {
        console.log(`🔍 Validando expresión: "${expression}"`);
        
        // Intentar corrección automática
        const correction = this.suggestCorrection(expression);
        
        try {
            // Evaluar expresión original
            const result = this.evaluate(expression);
            return {
                ...result,
                correction: correction.hasCorrections ? correction : null
            };
        } catch (error) {
            console.warn(`⚠️ Error en expresión original:`, error.message);
            
            // Si falla, intentar con la corrección
            if (correction.hasCorrections) {
                try {
                    console.log(`🔧 Intentando con corrección: "${correction.corrected}"`);
                    const correctedResult = this.evaluate(correction.corrected);
                    return {
                        ...correctedResult,
                        correction: correction,
                        usedCorrection: true,
                        originalError: error.message
                    };
                } catch (correctedError) {
                    console.error(`❌ Error también en corrección:`, correctedError.message);
                    return {
                        success: false,
                        error: error.message,
                        correction: correction,
                        correctionError: correctedError.message
                    };
                }
            }
            
            return {
                success: false,
                error: error.message,
                correction: correction.hasCorrections ? correction : null
            };
        }
    }
    
    /**
     * Obtiene información sobre las capacidades de las máquinas de Turing
     * @returns {Object} Información sobre las máquinas
     */
    static getMachineCapabilities() {
        return {
            simple: {
                description: "Máquinas de Turing completamente reales",
                examples: ["1 + 1", "1 + 0", "10 + 01"],
                features: [
                    "Estados auténticos (q0, q1, q2, ...)",
                    "Transiciones reales δ(estado, símbolo)",
                    "Procesamiento símbolo por símbolo",
                    "Cabezal que se mueve realmente en la cinta"
                ]
            },
            complex: {
                description: "Algoritmos auténticos con representación unaria",
                examples: ["101 + 110", "1000 - 11", "11 * 10"],
                features: [
                    "Conversión a representación unaria",
                    "Algoritmos reales de suma/resta/multiplicación/división",
                    "Manejo de acarreo y préstamo",
                    "Múltiples fases de procesamiento"
                ]
            },
            multiple: {
                description: "Múltiples máquinas para expresiones complejas",
                examples: ["(1 + 1) * 10", "(101 + 110) - 11"],
                features: [
                    "Una máquina por cada operación",
                    "Navegación entre máquinas",
                    "Resultados propagados entre operaciones",
                    "Historial completo de ejecución"
                ]
            }
        };
    }
}

// Exportar para uso global
window.ExpressionParser = ExpressionParser;