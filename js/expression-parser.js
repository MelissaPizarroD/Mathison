/**
 * Parser para expresiones binarias con múltiples operaciones y paréntesis
 */

class ExpressionParser {
    
    /**
     * Tokeniza una expresión en números y operadores
     * @param {string} expression - Expresión a tokenizar
     * @returns {Array} Array de tokens
     */
    static tokenize(expression) {
        // Limpiar espacios
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
        
        // Verificar que hay al menos una operación
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
                    
                    // Verificar que después de '(' no venga un operador
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
                    
                    // Verificar que antes de ')' no venga un operador
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
        // Verificar que no esté vacía después de remover paréntesis
        const nonParenTokens = tokens.filter(t => t.type !== 'parenthesis');
        if (nonParenTokens.length === 0) {
            return {
                valid: false,
                error: 'Solo hay paréntesis vacíos. Agrega números y operadores'
            };
        }
        
        // Verificar secuencia válida considerando paréntesis
        for (let i = 0; i < tokens.length; i++) {
            const current = tokens[i];
            const prev = i > 0 ? tokens[i - 1] : null;
            const next = i < tokens.length - 1 ? tokens[i + 1] : null;
            
            if (current.type === 'number') {
                // Un número puede estar después de: inicio, '(', operador
                if (prev && prev.type !== 'parenthesis' && prev.type !== 'operator') {
                    return {
                        valid: false,
                        error: `Número "${current.value}" en posición incorrecta. No puede estar después de "${prev.value}"`
                    };
                }
                
                // Un número puede estar antes de: fin, ')', operador  
                if (next && next.type !== 'parenthesis' && next.type !== 'operator') {
                    return {
                        valid: false,
                        error: `Número "${current.value}" seguido de "${next.value}". Debe haber un operador entre números`
                    };
                }
                
            } else if (current.type === 'operator') {
                // Un operador debe estar entre elementos válidos
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
        
        // Verificar que no termine con operador
        const lastToken = tokens[tokens.length - 1];
        if (lastToken.type === 'operator') {
            return {
                valid: false,
                error: `Expresión incompleta: termina con operador "${lastToken.value}". Agrega un número al final`
            };
        }
        
        // Verificar que no empiece con operador  
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
     * para evaluar respetando precedencia de operadores
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
     * Evalúa una expresión en notación postfija
     * @param {Array} postfixTokens - Tokens en notación postfija
     * @returns {Object} Resultado con pasos de ejecución
     */
    static evaluatePostfix(postfixTokens) {
        const stack = [];
        const steps = [];
        const machines = [];
        
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
                
                steps.push({
                    action: 'operation',
                    operator: token.value,
                    operands: [a, b],
                    description: `Ejecutando: ${a} ${token.value} ${b}`
                });
                
                // Ejecutar la operación con Máquina de Turing
                const operation = BinaryOperations.executeOperation(a, token.value, b);
                machines.push({
                    operation: `${a} ${token.value} ${b}`,
                    machine: operation.machine,
                    result: operation.result
                });
                
                if (operation.result.binary === 'ERROR') {
                    throw new Error(`Error en operación: ${a} ${token.value} ${b}`);
                }
                
                stack.push(operation.result.binary);
                steps.push({
                    action: 'result',
                    value: operation.result.binary,
                    stack: [...stack],
                    description: `Resultado: ${operation.result.binary} (${operation.result.decimal})`
                });
            }
        }
        
        if (stack.length !== 1) {
            throw new Error('Expresión mal formada: resultado ambiguo');
        }
        
        return {
            result: {
                binary: stack[0],
                decimal: stack[0].startsWith('-') ? 
                    -parseInt(stack[0].substring(1), 2) : 
                    parseInt(stack[0], 2)
            },
            steps: steps,
            machines: machines
        };
    }
    
    /**
     * Evalúa una expresión binaria completa
     * @param {string} expression - Expresión a evaluar
     * @returns {Object} Resultado completo con máquinas y pasos
     */
    static evaluate(expression) {
        try {
            // 1. Tokenizar
            const tokens = this.tokenize(expression);
            
            // 2. Validar
            const validation = this.validateTokens(tokens);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            
            // 3. Convertir a notación postfija
            const postfixTokens = this.toPostfix(tokens);
            
            // 4. Evaluar
            const evaluation = this.evaluatePostfix(postfixTokens);
            
            return {
                success: true,
                expression: expression,
                tokens: tokens,
                postfix: postfixTokens,
                result: evaluation.result,
                steps: evaluation.steps,
                machines: evaluation.machines
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                expression: expression
            };
        }
    }
    
    /**
     * Obtiene ejemplos de expresiones válidas
     * @returns {Array} Array de ejemplos
     */
    static getExamples() {
        return [
            // Ejemplos básicos
            '101 + 110',
            '1010 - 101', 
            '11 * 10',
            '1100 / 11',
            
            // Ejemplos con múltiples operaciones
            '101 + 110 - 11',
            '10 * 11 + 1',
            '1000 / 10 - 1',
            '101 + 110 * 10',
            
            // Ejemplos con paréntesis
            '(101 + 110) * 10',
            '11 + (1100 - 101)',
            '(10 + 11) * (11 - 1)',
            '((101 + 110) - 11) * 10',
            '1010 / (11 + 1)',
            
            // Ejemplos complejos
            '(101 * 10) + (110 / 11)',
            '((10 + 1) * 11) - (101 - 10)'
        ];
    }
    
    /**
     * Genera una expresión aleatoria para pruebas
     * @returns {string} Expresión aleatoria
     */
    static generateRandomExpression() {
        const operators = ['+', '-', '*', '/'];
        const maxBits = 4;
        
        // Generar 2-3 números
        const numCount = 2 + Math.floor(Math.random() * 2);
        const numbers = [];
        
        for (let i = 0; i < numCount; i++) {
            const bits = 1 + Math.floor(Math.random() * maxBits);
            let number = '';
            for (let j = 0; j < bits; j++) {
                number += Math.floor(Math.random() * 2);
            }
            // Asegurar que no comience con 0 (excepto el número 0)
            if (number.length > 1 && number[0] === '0') {
                number = '1' + number.substring(1);
            }
            numbers.push(number);
        }
        
        // Crear expresión
        let expression = numbers[0];
        for (let i = 1; i < numbers.length; i++) {
            const operator = operators[Math.floor(Math.random() * operators.length)];
            expression += ` ${operator} ${numbers[i]}`;
        }
        
        // 30% de probabilidad de agregar paréntesis
        if (Math.random() < 0.3 && numCount >= 3) {
            const parts = expression.split(' ');
            // Envolver los primeros dos números y operador en paréntesis
            if (parts.length >= 5) {
                expression = `(${parts.slice(0, 3).join(' ')}) ${parts.slice(3).join(' ')}`;
            }
        }
        
        return expression;
    }
    
    /**
     * Intenta corregir automáticamente errores comunes en expresiones
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
        
        // Corregir problemas con paréntesis
        
        // Balancear paréntesis faltantes
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
        
        // Corregir paréntesis adyacentes sin operador: (101)(110) → (101)*(110)
        const beforeMult = corrected;
        corrected = corrected.replace(/\)\s*\(/g, ')*(');
        if (corrected !== beforeMult) {
            corrections.push('Multiplicación implícita entre paréntesis agregada');
        }
        
        // Corregir números con dígitos inválidos (convertir a binario)
        corrected = corrected.replace(/\d+/g, (match) => {
            if (!/^[01]+$/.test(match)) {
                // Intentar convertir a binario si es un número decimal pequeño
                const decimal = parseInt(match, 10);
                if (!isNaN(decimal) && decimal >= 0 && decimal <= 1023) {
                    const binary = decimal.toString(2);
                    corrections.push(`Número ${match} convertido a binario: ${binary}`);
                    return binary;
                }
            }
            return match;
        });
        
        // Remover caracteres completamente inválidos
        const beforeClean = corrected;
        corrected = corrected.replace(/[^01+\-*\/xX÷\s()]/g, '');
        if (beforeClean !== corrected) {
            corrections.push('Caracteres inválidos removidos');
        }
        
        // Limpiar espacios finales
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
        // Primero intentar corrección automática
        const correction = this.suggestCorrection(expression);
        
        try {
            // Evaluar expresión original
            const result = this.evaluate(expression);
            return {
                ...result,
                correction: correction.hasCorrections ? correction : null
            };
        } catch (error) {
            // Si falla, intentar con la corrección
            if (correction.hasCorrections) {
                try {
                    const correctedResult = this.evaluate(correction.corrected);
                    return {
                        ...correctedResult,
                        correction: correction,
                        usedCorrection: true,
                        originalError: error.message
                    };
                } catch (correctedError) {
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
}

// Exportar para uso global
window.ExpressionParser = ExpressionParser;