// js/base-machine.js
class BaseTuringMachine {
    constructor() {
        this.tape = [];
        this.head = 0;
        this.state = 'LISTO';
        this.stepCount = 0;
        this.num1 = '';
        this.num2 = '';
        this.running = false;
        this.steps = [];
        this.operation = 'sum';
    }

    // Métodos base comunes a todas las operaciones
    logStep(description) {
        this.steps.push({
            step: this.stepCount,
            state: this.state,
            head: this.head,
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

    validateBinaryInput(num1, num2) {
        if (!/^[01]+$/.test(num1) || !/^[01]+$/.test(num2)) {
            alert('Por favor ingrese números binarios válidos (solo 0s y 1s)');
            return false;
        }
        return true;
    }

    initializeBaseTape(num1, num2, operator) {
        this.num1 = num1;
        this.num2 = num2;
        this.tape = ['#'];
        
        // Agregar primer número
        for (let digit of num1) {
            this.tape.push(digit);
        }
        
        this.tape.push(operator);
        
        // Agregar segundo número
        for (let digit of num2) {
            this.tape.push(digit);
        }
        
        this.tape.push('#');
        
        this.head = 0;
        this.stepCount = 0;
        this.steps = [];
        this.running = false;
    }

    // Método abstracto que debe ser implementado por cada operación
    executeStep() {
        throw new Error('executeStep debe ser implementado por la clase específica de operación');
    }

    // Método abstracto para inicializar
    initialize(num1, num2) {
        throw new Error('initialize debe ser implementado por la clase específica de operación');
    }
}