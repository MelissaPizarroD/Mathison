# 🤖 Calculadora Binaria con Máquinas de Turing

Una implementación educativa de una calculadora que opera con números binarios utilizando Máquinas de Turing, con visualización paso a paso del proceso interno y soporte completo para paréntesis.

## 🚀 Características

- ✅ **Operaciones binarias**: suma, resta, multiplicación y división
- ✅ **Visualización de Máquinas de Turing**: observa cómo trabaja la cinta paso a paso
- ✅ **Expresiones complejas**: soporte para paréntesis y múltiples operaciones como `(101 + 110) * (11 - 1)`
- ✅ **Corrección automática**: detecta y corrige errores comunes como `101 ++ 110` → `101 + 110`
- ✅ **Navegación interactiva**: controles para avanzar, retroceder y reproducción automática
- ✅ **Validación robusta**: mensajes de error específicos y sugerencias útiles
- ✅ **Resultados duales**: muestra resultados en binario y decimal
- ✅ **Diseño responsive**: funciona perfectamente en dispositivos móviles y escritorio

## 📁 Estructura del Proyecto

```
calculadora-binaria-turing/
├── index.html                 # Página principal con interfaz completa
├── css/
│   └── style.css             # Estilos modernos y responsive
├── js/
│   ├── main.js               # Archivo principal que coordina la aplicación
│   ├── turing-machine.js     # Implementación base de la Máquina de Turing
│   ├── binary-operations.js  # Operaciones binarias específicas
│   ├── expression-parser.js  # Parser con soporte para paréntesis y corrección automática
│   └── visualization.js      # Manejo de la visualización interactiva
└── README.md                 # Esta documentación
```

## 🛠️ Instalación y Uso

### Para GitHub Pages:

1. **Crear repositorio** en GitHub
2. **Subir todos los archivos** manteniendo exactamente la estructura de carpetas mostrada arriba
3. **Activar GitHub Pages** en Settings → Pages → Source: Deploy from branch → main
4. **Acceder** a tu calculadora en `https://tu-usuario.github.io/nombre-repositorio`

### Para uso local:

1. **Descargar** todos los archivos en la estructura correcta
2. **Abrir** `index.html` en un navegador web moderno
3. **¡Listo!** No requiere servidor web ni dependencias adicionales

## 📖 Cómo Usar

### Operadores Soportados
- **`+`** : Suma
- **`-`** : Resta  
- **`*` o `x`** : Multiplicación
- **`/` o `÷`** : División
- **`( )`** : Paréntesis para cambiar precedencia

### Ejemplos de Expresiones

#### Básicas:
```
101 + 110           # Suma simple → 1101 (13)
1010 - 101          # Resta simple → 101 (5)  
11 * 10             # Multiplicación → 110 (6)
1100 / 11           # División → 100 (4)
```

#### Con múltiples operaciones:
```
101 + 110 - 11      # Operaciones secuenciales → 1000 (8)
10 * 11 + 1         # Con precedencia → 1111 (15)
1000 / 10 - 1       # División y resta → 11 (3)
```

#### Con paréntesis:
```
(101 + 110) * 10    # Cambiar precedencia → 10110 (22)
11 + (1100 - 101)   # Operación anidada → 1010 (10)
(10 + 11) * (11 - 1) # Múltiples grupos → 10100 (20)
((101 + 110) - 11) * 10 # Paréntesis anidados → 10000 (16)
```

### Características Especiales
- **Doble clic** en el campo de entrada para cargar un ejemplo aleatorio
- **Enter** para calcular rápidamente
- **Clic en los pasos** del historial para navegar directamente a ese punto
- **Control de velocidad** para ajustar la reproducción automática
- **Botón de ayuda** para ver todos los ejemplos y características

## 🔧 Corrección Automática Inteligente

La calculadora detecta y corrige automáticamente errores comunes:

### Operadores Dobles:
- **`101 ++ 110`** → **`101 + 110`** ✅
- **`10 ** 11`** → **`10 * 11`** ✅
- **`101 xx 110`** → **`101 * 110`** ✅

### Paréntesis:
- **`101 + (110`** → **`101 + (110)`** (agrega paréntesis faltante) ✅
- **`101 + 110)`** → **`(101 + 110)`** (agrega paréntesis de apertura) ✅
- **`(101)(110)`** → **`(101)*(110)`** (agrega multiplicación implícita) ✅

### Espacios:
- **`101  +   110`** → **`101 + 110`** (limpia espacios excesivos) ✅

## 🎯 Funcionalidades de la Visualización

### Cinta de la Máquina de Turing
- **Celdas resaltadas**: la celda actual se marca en dorado
- **Cabezal dinámico**: flecha que indica la posición actual de lectura/escritura
- **Scroll automático**: la cinta se ajusta automáticamente al contenido
- **Símbolos claros**: muestra claramente 0, 1 y espacios en blanco (B)

### Controles de Navegación
- **← Anterior**: retrocede un paso en la ejecución
- **Siguiente →**: avanza un paso hacia adelante
- **▶ Auto**: reproducción automática con velocidad ajustable
- **Control de velocidad**: deslizador para ajustar velocidad de 100ms a 2000ms

### Información de Estado
- **Operación actual**: muestra qué operación matemática se está ejecutando
- **Estado de la máquina**: estado interno actual (q0, q1, qf, etc.)
- **Posición del cabezal**: índice actual en la cinta

### Navegador de Operaciones
- **Múltiples máquinas**: para expresiones complejas, navega entre diferentes operaciones
- **Botones interactivos**: clic directo para saltar a cualquier operación
- **Progreso visual**: indica qué operación se está visualizando actualmente

## 🛡️ Validaciones Implementadas

### ✅ **Detecta y Rechaza:**
- **Operadores consecutivos**: `++`, `**`, `xx`, `//` ❌
- **Caracteres inválidos**: letras, números decimales (2-9), símbolos especiales ❌
- **Expresiones incompletas**: `10 +`, `+ 10` ❌
- **Paréntesis desbalanceados**: `(101 + 110`, `101 + 110)` ❌
- **Operadores mal posicionados**: `(+ 101)`, `(101 +)` ❌
- **Solo números**: `101` (sin operaciones) ❌

### 💡 **Mensajes Específicos:**
En lugar de errores genéricos, muestra mensajes útiles como:
- *"Operadores consecutivos detectados: '++'. Cada operador debe estar entre dos números"*
- *"Carácter no válido encontrado: 'a'. Solo se permiten dígitos binarios (0,1) y operadores"*
- *"Paréntesis sin cerrar. Faltan 2 paréntesis de cierre ')'"*
- *"¿Quisiste decir: '101 + 110'?"* con botón para aplicar automáticamente

## 🎮 Flujo de Usuario

1. **Ingresa una expresión** binaria como `(101 + 110) * 10`
2. **La calculadora valida** automáticamente y sugiere correcciones si es necesario
3. **Al calcular**, muestra el resultado y crea las Máquinas de Turing correspondientes
4. **Navega paso a paso** para ver exactamente cómo se procesan las operaciones
5. **Explora diferentes operaciones** si la expresión tiene múltiples cálculos

## 🔧 Arquitectura Técnica

### Componentes Principales

#### 1. `TuringMachine` (turing-machine.js)
- **Clase base** para todas las máquinas de Turing
- **Manejo de estados**: transiciones, cinta, cabezal
- **Historial completo**: permite navegación hacia atrás y adelante
- **Métodos principales**: `step()`, `run()`, `saveState()`, `restoreState()`

#### 2. `BinaryOperations` (binary-operations.js)
- **Máquinas específicas** para cada operación matemática
- **Configuración de transiciones** para suma, resta, multiplicación, división
- **Cálculo directo** para comparación y verificación de resultados
- **Manejo de casos especiales** como división por cero y números negativos

#### 3. `ExpressionParser` (expression-parser.js)
- **Tokenización robusta** con validación de caracteres
- **Soporte completo para paréntesis** con validación de balance
- **Conversión a notación postfija** (Reverse Polish Notation) para evaluar precedencia
- **Corrección automática** de errores comunes
- **Validación estructural** detallada con mensajes específicos

#### 4. `TuringVisualization` (visualization.js)
- **Renderizado dinámico** de la cinta con scroll automático
- **Animaciones suaves** para transiciones entre estados
- **Controles interactivos** para navegación manual y automática
- **Gestión de estado visual** sincronizada con la máquina de Turing

#### 5. `BinaryCalculatorApp` (main.js)
- **Coordinador central** que conecta todos los componentes
- **Manejo de eventos** de usuario y navegación
- **Gestión de estado** de la aplicación completa
- **Sistema de notificaciones** y manejo de errores

## 🎨 Personalización

### Modificar Estilos
Edita `css/style.css` para cambiar:
- **Colores**: gradientes, acentos, esquema de colores
- **Tipografías**: tamaños, fuentes, espaciado  
- **Animaciones**: velocidad, efectos, transiciones
- **Layout**: responsive breakpoints, grid layouts

### Agregar Nuevas Operaciones
En `binary-operations.js`:
1. **Crear función** `createXXXMachine()` para la nueva operación
2. **Definir transiciones** específicas de la máquina de Turing
3. **Actualizar el parser** en `expression-parser.js` para reconocer el operador
4. **Añadir casos de prueba** y ejemplos

### Modificar Velocidades por Defecto
En `visualization.js`, cambiar:
```javascript
this.animationSpeed = 800; // milisegundos entre pasos
```

### Personalizar Ejemplos
En `expression-parser.js`, método `getExamples()`:
```javascript
static getExamples() {
    return [
        'tu-expresion-personalizada',
        // ... más ejemplos
    ];
}
```

## 🐛 Solución de Problemas Comunes

### La cinta no se muestra correctamente
- **Verificar** que todos los archivos JS estén cargando sin errores
- **Abrir consola** del navegador (F12) para ver mensajes de error
- **Comprobar** que la estructura de carpetas sea exacta

### Las operaciones no calculan correctamente
- **Usar solo números binarios** válidos (solo dígitos 0 y 1)
- **Verificar sintaxis** de la expresión con los ejemplos proporcionados
- **Probar expresiones simples** primero antes de las complejas

### Problemas de rendimiento o navegador
- **Expresiones muy largas** pueden ser lentas; usar modo paso a paso
- **Navegadores antiguos** pueden no soportar todas las características
- **JavaScript deshabilitado** impide el funcionamiento completo

### Errores en GitHub Pages
- **Verificar** que todos los archivos estén subidos con nombres exactos
- **Comprobar** que la estructura de carpetas sea correcta
- **Esperar** unos minutos después de activar GitHub Pages

## 🤝 Contribuir y Extender

### Ideas para Mejoras
- [ ] **Números fraccionarios**: soporte para punto decimal binario
- [ ] **Más operaciones**: potenciación, módulo, operaciones bit a bit
- [ ] **Modo debug**: visualización detallada de transiciones de estado
- [ ] **Exportar/importar**: guardar y cargar configuraciones de máquinas
- [ ] **Sonidos**: efectos de audio para las transiciones
- [ ] **Temas visuales**: modo oscuro, colores personalizables
- [ ] **Historial de cálculos**: guardar sesiones anteriores
- [ ] **Máquinas optimizadas**: implementaciones más eficientes

### Cómo Contribuir
1. **Fork** del repositorio en GitHub
2. **Crear rama** para tu nueva característica: `git checkout -b mi-nueva-caracteristica`
3. **Implementar y probar** los cambios exhaustivamente
4. **Crear Pull Request** con descripción detallada de los cambios
5. **Documentar** nuevas características en el README

### Estándares de Código
- **ES6+**: usar características modernas de JavaScript
- **Comentarios**: documentar funciones y lógica compleja
- **Nombres descriptivos**: variables y funciones auto-explicativas
- **Modularidad**: mantener componentes separados y reutilizables

## 📚 Recursos Educativos

### Conceptos Clave Implementados
- **Máquinas de Turing**: modelo fundamental de computación teórica
- **Números binarios**: sistema de numeración base 2 usado en computadoras
- **Algoritmos**: secuencias de pasos para resolver problemas matemáticos
- **Precedencia de operadores**: orden matemático de evaluación
- **Parsing**: análisis y transformación de expresiones matemáticas

### Para Aprender Más
- [Introducción a las Máquinas de Turing](https://es.wikipedia.org/wiki/M%C3%A1quina_de_Turing)
- [Sistema binario y operaciones](https://es.wikipedia.org/wiki/Sistema_binario)
- [Teoría de la computación](https://es.wikipedia.org/wiki/Teor%C3%ADa_de_la_computaci%C3%B3n)
- [Notación polaca inversa](https://es.wikipedia.org/wiki/Notaci%C3%B3n_polaca_inversa)
- [Análisis sintáctico](https://es.wikipedia.org/wiki/An%C3%A1lisis_sint%C3%A1ctico)

### Aplicaciones Educativas
- **Cursos de ciencias de la computación**: demostración visual de conceptos teóricos
- **Matemáticas binarias**: práctica interactiva con operaciones
- **Algoritmos**: comprensión de procesamiento paso a paso
- **Programación**: ejemplo de arquitectura modular y orientada a objetos

## 📊 Casos de Uso

### Estudiantes
- **Aprender** cómo funcionan las operaciones binarias internamente
- **Visualizar** conceptos abstractos de máquinas de Turing
- **Practicar** con expresiones matemáticas complejas
- **Experimentar** con diferentes configuraciones

### Educadores
- **Demostrar** conceptos de computación teórica
- **Enseñar** sistemas numéricos binarios
- **Explicar** precedencia de operadores
- **Mostrar** parsing y evaluación de expresiones

### Desarrolladores
- **Estudiar** implementación de máquinas de Turing
- **Analizar** arquitectura de aplicaciones web modulares
- **Aprender** técnicas de visualización interactiva
- **Inspirarse** para proyectos educativos similares

## 📄 Licencia

Este proyecto es de **uso educativo gratuito** y está disponible bajo licencia MIT. 

**Libertades incluidas:**
- ✅ Usar comercial y personalmente
- ✅ Modificar y distribuir
- ✅ Incluir en proyectos privados
- ✅ Sublicenciar a terceros

**Requisitos:**
- 📄 Incluir aviso de copyright original
- 📄 Incluir texto de licencia MIT

## 🏆 Créditos y Reconocimientos

**Desarrollado como herramienta educativa** para visualizar conceptos fundamentales de ciencias de la computación.

**Tecnologías utilizadas:**
- **HTML5** para estructura semántica
- **CSS3** con gradientes y animaciones modernas  
- **JavaScript ES6+** para lógica de aplicación
- **Arquitectura modular** para mantenibilidad
- **Responsive Design** para accesibilidad universal

---

## 🚀 ¡Comenzar Ahora!

1. **Descarga** todos los archivos de este proyecto
2. **Organiza** en la estructura de carpetas mostrada
3. **Abre** `index.html` en tu navegador
4. **Prueba** con expresiones como `(101 + 110) * (11 - 1)`
5. **Explora** la visualización paso a paso
6. **Disfruta** aprendiendo sobre Máquinas de Turing! 🤖✨

**¿Preguntas o problemas?** Revisa la sección de [Solución de Problemas](#-solución-de-problemas-comunes) o crea un issue en el repositorio.

**¡Feliz exploración del fascinante mundo de las Máquinas de Turing!** 🎓💻