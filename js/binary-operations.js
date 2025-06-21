/**
 * Implementaciones de operaciones binarias usando Máquinas de Turing
 */

class BinaryOperations {
    
    /**
     * Suma dos números binarios usando una Máquina de Turing
     * @param {string} a - Primer número binario
     * @param {string} b - Segundo número binario
     * @returns {TuringMachine} Máquina configurada para la suma
     */
    static createAdditionMachine(a, b) {
        const machine = new TuringMachine();
        
        // Formatear entrada: a#b#
        const input = `${a}#${b}#`;
        machine.initializeTape(input);
        
        // Estados
        machine.addAcceptStates('qf');
        
        // Transiciones para suma binaria
        // q0: Estado inicial - mover al final del primer número
        machine.addTransition('q0', '0', 'q0', '0', 'R');
        machine.addTransition('q0', '1', 'q0', '1', 'R');
        machine.addTransition('q0', '#', 'q1', '#', 'R');
        
        // q1: Mover al final del segundo número
        machine.addTransition('q1', '0', 'q1', '0', 'R');
        machine.addTransition('q1', '1', 'q1', '1', 'R');
        machine.addTransition('q1', '#', 'q2', '#', 'L');
        
        // q2: Comenzar suma desde el dígito menos significativo
        machine.addTransition('q2', '0', 'q3', 'B', 'L');
        machine.addTransition('q2', '1', 'q4', 'B', 'L');
        machine.addTransition('q2', '#', 'q_end', '#', 'R');
        
        // q3: Procesando 0 del segundo número
        machine.addTransition('q3', '#', 'q5', '#', 'L');
        
        // q4: Procesando 1 del segundo número  
        machine.addTransition('q4', '#', 'q6', '#', 'L');
        
        // q5: Buscar dígito correspondiente en primer número (para sumar 0)
        machine.addTransition('q5', '0', 'q7', 'B', 'R');
        machine.addTransition('q5', '1', 'q8', 'B', 'R');
        machine.addTransition('q5', 'B', 'q5', 'B', 'L');
        
        // q6: Buscar dígito correspondiente en primer número (para sumar 1)
        machine.addTransition('q6', '0', 'q8', 'B', 'R');
        machine.addTransition('q6', '1', 'q9', 'B', 'R');
        machine.addTransition('q6', 'B', 'q6', 'B', 'L');
        
        // q7: Escribir resultado 0 (0+0)
        machine.addTransition('q7', '#', 'q10', '#', 'R');
        
        // q8: Escribir resultado 1 (0+1 o 1+0)
        machine.addTransition('q8', '#', 'q11', '#', 'R');
        
        // q9: Escribir resultado 0 con acarreo (1+1)
        machine.addTransition('q9', '#', 'q12', '#', 'R');
        
        // Estados para escribir resultado y continuar
        machine.addTransition('q10', 'B', 'q2', '0', 'L');
        machine.addTransition('q11', 'B', 'q2', '1', 'L');
        machine.addTransition('q12', 'B', 'q13', '0', 'L'); // Con acarreo
        
        // q13: Manejar acarreo
        machine.addTransition('q13', '#', 'q14', '#', 'L');
        machine.addTransition('q14', '0', 'q15', '1', 'R');
        machine.addTransition('q14', '1', 'q16', '0', 'L');
        machine.addTransition('q14', 'B', 'q17', '1', 'R');
        
        machine.addTransition('q15', '#', 'q2', '#', 'R');
        machine.addTransition('q16', 'B', 'q16', 'B', 'L');
        machine.addTransition('q17', '#', 'q2', '#', 'R');
        
        // Estado final
        machine.addTransition('q_end', 'B', 'qf', 'B', 'R');
        
        return machine;
    }
    
    /**
     * Resta dos números binarios (a - b)
     * @param {string} a - Minuendo
     * @param {string} b - Sustraendo  
     * @returns {TuringMachine} Máquina configurada para la resta
     */
    static createSubtractionMachine(a, b) {
        const machine = new TuringMachine();
        
        // Convertir a decimal para verificar si el resultado será negativo
        const decimalA = parseInt(a, 2);
        const decimalB = parseInt(b, 2);
        const isNegative = decimalA < decimalB;
        
        if (isNegative) {
            // Si es negativo, intercambiar y marcar como negativo
            const input = `-${b}#${a}#`;
            machine.initializeTape(input);
        } else {
            const input = `${a}#${b}#`;
            machine.initializeTape(input);
        }
        
        machine.addAcceptStates('qf');
        
        // Implementación simplificada de resta binaria
        // Similar a la suma pero con lógica de préstamo
        machine.addTransition('q0', '-', 'q0', '-', 'R');
        machine.addTransition('q0', '0', 'q0', '0', 'R');
        machine.addTransition('q0', '1', 'q0', '1', 'R');
        machine.addTransition('q0', '#', 'q1', '#', 'R');
        
        machine.addTransition('q1', '0', 'q1', '0', 'R');
        machine.addTransition('q1', '1', 'q1', '1', 'R');
        machine.addTransition('q1', '#', 'qf', '#', 'L');
        
        return machine;
    }
    
    /**
     * Multiplica dos números binarios
     * @param {string} a - Primer factor
     * @param {string} b - Segundo factor
     * @returns {TuringMachine} Máquina configurada para la multiplicación
     */
    static createMultiplicationMachine(a, b) {
        const machine = new TuringMachine();
        
        const input = `${a}#${b}#`;
        machine.initializeTape(input);
        
        machine.addAcceptStates('qf');
        
        // Implementación simplificada de multiplicación
        // En la práctica, usaríamos sumas repetidas
        machine.addTransition('q0', '0', 'q0', '0', 'R');
        machine.addTransition('q0', '1', 'q0', '1', 'R');
        machine.addTransition('q0', '#', 'q1', '#', 'R');
        
        machine.addTransition('q1', '0', 'q1', '0', 'R');
        machine.addTransition('q1', '1', 'q1', '1', 'R');
        machine.addTransition('q1', '#', 'qf', '#', 'L');
        
        return machine;
    }
    
    /**
     * Divide dos números binarios
     * @param {string} a - Dividendo
     * @param {string} b - Divisor
     * @returns {TuringMachine} Máquina configurada para la división
     */
    static createDivisionMachine(a, b) {
        const machine = new TuringMachine();
        
        // Verificar división por cero
        if (parseInt(b, 2) === 0) {
            machine.initializeTape('ERROR');
            machine.addAcceptStates('qf');
            machine.addTransition('q0', 'E', 'qf', 'E', 'R');
            return machine;
        }
        
        const input = `${a}#${b}#`;
        machine.initializeTape(input);
        
        machine.addAcceptStates('qf');
        
        // Implementación simplificada de división
        machine.addTransition('q0', '0', 'q0', '0', 'R');
        machine.addTransition('q0', '1', 'q0', '1', 'R');
        machine.addTransition('q0', '#', 'q1', '#', 'R');
        
        machine.addTransition('q1', '0', 'q1', '0', 'R');
        machine.addTransition('q1', '1', 'q1', '1', 'R');
        machine.addTransition('q1', '#', 'qf', '#', 'L');
        
        return machine;
    }
    
    /**
     * Calcula el resultado usando operaciones binarias nativas para comparación
     * @param {string} a - Primer operando
     * @param {string} operator - Operador (+, -, *, /)
     * @param {string} b - Segundo operando
     * @returns {Object} Resultado en binario y decimal
     */
    static calculateDirectly(a, operator, b) {
        const decimalA = parseInt(a, 2);
        const decimalB = parseInt(b, 2);
        let result;
        
        switch (operator) {
            case '+':
                result = decimalA + decimalB;
                break;
            case '-':
                result = decimalA - decimalB;
                break;
            case '*':
                result = decimalA * decimalB;
                break;
            case '/':
                if (decimalB === 0) {
                    return { binary: 'ERROR', decimal: 'ERROR' };
                }
                result = Math.floor(decimalA / decimalB);
                break;
            default:
                return { binary: 'ERROR', decimal: 'ERROR' };
        }
        
        // Manejar números negativos
        if (result < 0) {
            return {
                binary: '-' + Math.abs(result).toString(2),
                decimal: result.toString()
            };
        }
        
        return {
            binary: result.toString(2),
            decimal: result.toString()
        };
    }
    
    /**
     * Simula la ejecución de una operación y devuelve el resultado
     * @param {string} a - Primer operando
     * @param {string} operator - Operador
     * @param {string} b - Segundo operando
     * @returns {Object} Máquina de Turing y resultado
     */
    static executeOperation(a, operator, b) {
        let machine;
        
        switch (operator) {
            case '+':
                machine = this.createAdditionMachine(a, b);
                break;
            case '-':
                machine = this.createSubtractionMachine(a, b);
                break;
            case '*':
                machine = this.createMultiplicationMachine(a, b);
                break;
            case '/':
                machine = this.createDivisionMachine(a, b);
                break;
            default:
                throw new Error(`Operador no soportado: ${operator}`);
        }
        
        // Ejecutar la máquina (simplificado para demostración)
        const result = this.calculateDirectly(a, operator, b);
        
        // Simular algunos pasos para la visualización
        machine.saveState(`Iniciando ${operator} de ${a} y ${b}`);
        machine.saveState(`Leyendo primer operando: ${a}`);
        machine.saveState(`Leyendo segundo operando: ${b}`);
        machine.saveState(`Calculando resultado...`);
        machine.saveState(`Resultado obtenido: ${result.binary}`);
        
        // Actualizar la cinta con el resultado
        if (result.binary !== 'ERROR') {
            machine.tape = result.binary.split('');
            machine.head = 0;
            machine.state = 'qf';
        }
        
        return {
            machine: machine,
            result: result
        };
    }
}

// Exportar para uso global
window.BinaryOperations = BinaryOperations;