##Simulador de Suma Binaria con Máquina de Turing

Este simulador implementa una máquina de Turing que realiza la suma de dos números binarios. Utiliza una cinta lineal donde coloca los dos operandos separados por un símbolo `+`, y produce el resultado después de un símbolo `=`. La máquina recorre la cinta desde el bit menos significativo al más significativo, sumando cada par de bits junto con un **acarreo (`carry`) almacenado en el estado. 

Aunque no realiza directamente la operación aritmética `(X + Y + carry) % 2` ni `(X + Y + carry) / 2`, simula su efecto usando transiciones finitas para cada una de las 8 combinaciones posibles de bits y acarreo. El resultado parcial se escribe en la cinta y luego se invierte para que quede en orden correcto. 

A pesar de estar implementada en JavaScript, la lógica respeta el modelo teórico de una máquina de Turing: cinta infinita (simulada), cabezal de lectura/escritura, conjunto finito de estados, y transiciones condicionadas por símbolos.
