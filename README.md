
<div align="center">

# 🌱 AgroSense-Web3

### 🚀 Plataforma Inteligente de Agricultura + IoT + Blockchain Solana

Monitoreo agrícola en tiempo real, automatización de riego e identidad Web3 utilizando Solana.

---

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge\&logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge\&logo=node.js\&logoColor=white)
![Solana](https://img.shields.io/badge/Solana-Web3-9945FF?style=for-the-badge\&logo=solana\&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge\&logo=docker\&logoColor=white)
![ESP32](https://img.shields.io/badge/ESP32-IoT-E7352C?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge\&logo=mongodb\&logoColor=white)

---

### 🌾 Agricultura Inteligente • 🔗 Web3 • 📡 IoT • ⚡ Solana

</div>

---

# 📚 Índice

* [📖 Descripción general](#-descripción-general)
* [🎯 Objetivo del proyecto](#-objetivo-del-proyecto)
* [🚨 Problemática](#-problemática)
* [💡 Solución propuesta](#-solución-propuesta)
* [🧠 ¿Qué hace AgroSense-Web3?](#-qué-hace-agrosense-web3)
* [🏗️ Arquitectura general](#️-arquitectura-general)
* [🔗 Integración Blockchain Solana](#-integración-blockchain-solana)
* [🧬 Funcionamiento Web3](#-funcionamiento-web3)
* [🌐 Frontend](#-frontend)
* [⚙️ Backend](#️-backend)
* [📡 IoT y ESP32](#-iot-y-esp32)
* [📊 Dashboard agrícola](#-dashboard-agrícola)
* [🔒 Seguridad](#-seguridad)
* [🐳 Docker y contenedores](#-docker-y-contenedores)
* [📁 Estructura del proyecto](#-estructura-del-proyecto)
* [⚙️ Variables de entorno](#️-variables-de-entorno)
* [🚀 Instalación completa](#-instalación-completa)
* [📦 Ejecución con Docker](#-ejecución-con-docker)
* [🛰️ Flujo completo del sistema](#️-flujo-completo-del-sistema)
* [📈 Variables monitoreadas](#-variables-monitoreadas)
* [📨 Sistema de correos](#-sistema-de-correos)
* [🧩 APIs utilizadas](#-apis-utilizadas)
* [🛠️ Tecnologías utilizadas](#️-tecnologías-utilizadas)
* [🧪 Estado actual del proyecto](#-estado-actual-del-proyecto)
* [🚧 Próximas mejoras](#-próximas-mejoras)
* [🌎 Aplicaciones reales](#-aplicaciones-reales)
* [🏆 Enfoque Web3 y Solana](#-enfoque-web3-y-solana)
* [👨‍💻 Autor](#-autor)
* [📄 Licencia](#-licencia)

---

# 📖 Descripción general

## 🌱 ¿Qué es AgroSense-Web3?

AgroSense-Web3 es una plataforma de agricultura inteligente que integra tecnologías de Internet de las Cosas, automatización agrícola, microservicios distribuidos, comunicación en tiempo real, persistencia de datos y elementos de identidad Web3.

El sistema fue diseñado para monitorear cultivos agrícolas mediante sensores conectados a dispositivos ESP32, procesar la información mediante microservicios independientes, clasificar condiciones críticas y ejecutar acciones de riego de forma automática o manual.

Aunque el proyecto conserva su identidad Web3 y su integración con Solana, la arquitectura actual fue fortalecida para funcionar como una plataforma distribuida completa, incorporando tecnologías como MQTT, Redis, gRPC, PostgreSQL maestro-réplica, Docker Compose, Nginx y Socket.IO.

---

## 🌾 Propósito del sistema

El propósito principal de AgroSense-Web3 es ofrecer una solución tecnológica capaz de:

* Monitorear variables agrícolas en tiempo real.
* Automatizar decisiones de riego.
* Administrar múltiples zonas agrícolas.
* Clasificar alertas según prioridad.
* Notificar eventos al operador en tiempo real.
* Guardar historial de lecturas y acciones.
* Mantener disponibilidad mediante microservicios.
* Evitar pérdida de eventos usando colas Redis.
* Ejecutarse de forma reproducible con Docker Compose.
* Integrar identidad Web3 mediante Solana y Phantom Wallet.

---

## 🧩 Enfoque académico

Este proyecto fue adaptado para cumplir una arquitectura distribuida similar a un sistema de alertas tipo C5, pero aplicado al contexto agrícola.

En lugar de recibir alertas ciudadanas por botón de pánico, AgroSense recibe alertas agrícolas generadas por sensores.

La adaptación general es:

| Sistema C5 solicitado   | Adaptación en AgroSense                      |
| ----------------------- | -------------------------------------------- |
| Ciudadano en emergencia | Cultivo o zona agrícola en condición crítica |
| Botón de pánico ESP32   | ESP32 con sensores agrícolas                 |
| Coordenadas GPS         | Zona, sector y cultivo                       |
| Tipo de emergencia      | Condición agrícola detectada                 |
| Unidad de respuesta     | Bomba o actuador de riego                    |
| Operador C5             | Operador del dashboard AgroSense             |
| Historial de incidentes | Historial de eventos agrícolas               |

---

# 🎯 Objetivo del proyecto

El objetivo general de AgroSense-Web3 es desarrollar una plataforma distribuida de agricultura inteligente capaz de recibir datos desde dispositivos IoT, procesarlos mediante microservicios independientes, generar alertas, ejecutar acciones de riego y notificar al operador en tiempo real.

---

## 🎯 Objetivos específicos

* Implementar comunicación IoT mediante ESP32 y MQTT.
* Utilizar Mosquitto como broker MQTT.
* Procesar lecturas agrícolas mediante microservicios desacoplados.
* Usar Redis como sistema de colas en memoria.
* Implementar comunicación gRPC entre microservicios.
* Clasificar eventos agrícolas mediante reglas de prioridad.
* Activar o bloquear riego de acuerdo con las condiciones del cultivo.
* Enviar notificaciones en tiempo real mediante Socket.IO.
* Guardar eventos en PostgreSQL.
* Configurar PostgreSQL maestro-réplica.
* Desplegar todo el sistema mediante Docker Compose.
* Permitir acceso centralizado mediante Nginx.
* Mantener funcionalidades Web3 mediante Solana y Phantom Wallet.

---

# 🚨 Problemática

La agricultura tradicional enfrenta retos importantes relacionados con monitoreo, eficiencia y disponibilidad de información.

Algunos problemas comunes son:

* Falta de monitoreo en tiempo real.
* Uso ineficiente del agua.
* Riego manual poco preciso.
* Falta de historial de eventos.
* Ausencia de alertas automáticas.
* Procesos centralizados.
* Dificultad para escalar sistemas agrícolas.
* Pérdida de información por fallos.
* Falta de trazabilidad técnica.
* Baja automatización en pequeñas y medianas unidades agrícolas.

---

## Problema técnico

Desde el punto de vista técnico, un sistema agrícola moderno necesita:

* Recibir datos desde sensores físicos.
* Procesar eventos en tiempo real.
* Clasificar condiciones críticas.
* Ejecutar acciones automáticas.
* Mantener comunicación entre múltiples servicios.
* Tolerar fallos parciales.
* Almacenar información histórica.
* Permitir consultas y visualización.
* Ejecutarse en una infraestructura reproducible.

---

# 💡 Solución propuesta

AgroSense-Web3 propone una plataforma distribuida donde cada responsabilidad del sistema se separa en microservicios independientes.

La solución utiliza:

* ESP32 para captura de datos.
* MQTT para comunicación IoT.
* Redis para colas distribuidas.
* gRPC para comunicación interna eficiente.
* Socket.IO para tiempo real.
* PostgreSQL para persistencia.
* PostgreSQL réplica para replicación.
* Docker Compose para orquestación.
* Nginx como reverse proxy.
* Frontend web para operación.
* Backend API para control y estado.
* Solana para identidad Web3.

---

## Beneficios de la solución

* Mayor escalabilidad.
* Mejor tolerancia a fallos.
* Procesamiento distribuido.
* Comunicación desacoplada.
* Alertas en tiempo real.
* Automatización de riego.
* Persistencia histórica.
* Visualización clara.
* Integración IoT.
* Integración Web3.

---

# 🧠 ¿Qué hace AgroSense-Web3?

AgroSense-Web3 permite al operador agrícola monitorear y controlar zonas de cultivo en tiempo real.

El sistema recibe datos de sensores, los clasifica, determina si existe una alerta, decide si debe activar la bomba y registra el evento completo.

---

## Funciones principales

* Recibe lecturas desde ESP32.
* Valida datos de sensores.
* Procesa zona agrícola.
* Clasifica prioridad del evento.
* Decide acción de riego.
* Activa o apaga bomba.
* Genera historial.
* Envía notificaciones.
* Guarda datos en PostgreSQL.
* Actualiza dashboard en tiempo real.

---

## Variables principales

* Humedad.
* pH.
* Temperatura.
* Zona.
* Sector.
* Cultivo.
* Prioridad.
* Acción.
* Estado de bomba.
* Sensor origen.
* Fecha de evento.
* Instancia que procesó el evento.

---

# 🏗️ Arquitectura general

La arquitectura actual de AgroSense-Web3 se basa en microservicios distribuidos.

Cada componente tiene una responsabilidad específica y se comunica mediante protocolos adecuados según su función.

---

## Diagrama lógico simplificado

```text
USUARIO / OPERADOR
      │
      ▼
NGINX :8080
      │
      ▼
FRONTEND WEB
      │
      ▼
BACKEND API
      │
      ▼
SOCKET.IO
```

```text
ESP32
  │
  ▼
MQTT / MOSQUITTO
  │
  ▼
RECEPCIÓN-SENSORES x3
  │
  ▼
REDIS cola:sensores
  │
  ▼
ZONAS-AGRÍCOLAS
  │
  ▼ gRPC
PRIORIDAD-RIEGO
  │
  ├── MQTT → BOMBAS / ACTUADORES
  │
  ▼
REDIS cola:prioridad
  │
  ▼
HISTORIAL-EVENTOS
  │
  ├── REDIS cola:notificaciones
  │        ▼
  │   NOTIFICACIONES
  │        ▼
  │   SOCKET.IO
  │        ▼
  │   FRONTEND
  │
  └── REDIS cola:historial
           ▼
      PERSISTENCIA
           ▼
      POSTGRESQL MASTER
           ▼
      POSTGRESQL REPLICA
```

---

## Componentes principales

| Componente         | Responsabilidad                       |
| ------------------ | ------------------------------------- |
| ESP32              | Captura de datos físicos              |
| Mosquitto          | Broker MQTT                           |
| Recepción-Sensores | Validar y encolar mensajes            |
| Redis              | Sistema de colas                      |
| Zonas-Agrícolas    | Procesar zona, sector y cultivo       |
| Prioridad-Riego    | Clasificar prioridad y decidir acción |
| Historial-Eventos  | Registrar eventos y distribuirlos     |
| Notificaciones     | Emitir alertas en tiempo real         |
| Persistencia       | Guardar eventos en PostgreSQL         |
| PostgreSQL Master  | Escritura principal                   |
| PostgreSQL Replica | Réplica de lectura                    |
| Backend            | API principal y estado del sistema    |
| Frontend           | Interfaz del operador                 |
| Nginx              | Reverse proxy y acceso centralizado   |

---

# 🔗 Integración Blockchain Solana

AgroSense-Web3 conserva un enfoque Web3 mediante integración con Solana y Phantom Wallet.

La capa Web3 permite gestionar identidad digital del usuario y mantener una visión moderna del sistema.

---

## Funciones Web3 consideradas

* Conexión con Phantom Wallet.
* Identidad de usuario mediante wallet.
* Relación de usuario con dashboard.
* Base para integración futura con programas en Solana.
* Posibilidad de registro on-chain.
* Verificación de identidad agrícola.

---

## Rol de Solana en el proyecto

Solana no sustituye la arquitectura distribuida agrícola, sino que funciona como una capa complementaria de identidad y trazabilidad Web3.

El sistema distribuido agrícola opera con MQTT, Redis, gRPC, PostgreSQL y Docker.

Solana funciona como una extensión para autenticación, identidad y futuras funciones de trazabilidad blockchain.

---

# 🧬 Funcionamiento Web3

## Registro Web3

```text
Usuario
↓
Frontend
↓
Conecta Phantom Wallet
↓
Valida identidad
↓
Crea sesión
↓
Accede al dashboard
```

---

## Login Web3

```text
Usuario conecta wallet
↓
Frontend detecta cuenta
↓
Valida sesión
↓
Acceso permitido
```

---

## Perfil de usuario

El usuario puede visualizar y actualizar información dentro del sistema.

La identidad Web3 puede asociarse con:

* Nombre.
* Wallet.
* Rol.
* Acceso al dashboard.
* Historial de actividad.

---

# 🌐 Frontend

El frontend representa la interfaz principal para el operador agrícola.

Está desarrollado con tecnologías modernas orientadas a interfaces dinámicas.

---

## Tecnologías del frontend

* Next.js.
* React.
* TypeScript.
* Tailwind CSS.
* Socket.IO Client.
* Recharts.
* Solana Web3.js.
* Phantom Wallet.

---

## Módulos del frontend

### Dashboard

Muestra datos generales del sistema.

Incluye:

* Humedad.
* pH.
* Temperatura.
* Estado de bomba.
* Estado de riego.
* Últimas alertas.
* Indicadores visuales.

---

### Gestión

Permite administrar el sistema de riego.

Incluye:

* Modo automático.
* Control manual.
* Estado de bomba.
* Zona seleccionada.
* Lecturas actuales.
* Historial por zona.

---

### Sistema

Muestra información técnica del sistema.

Incluye:

* Estado del ESP32.
* Conexión.
* Datos en tiempo real.
* Estado del backend.
* Estado de sensores.

---

### Analítica

Permite visualizar tendencias.

Incluye:

* Gráficas.
* Lecturas por sensor.
* Variación de humedad.
* Variación de pH.
* Variación de temperatura.

---

### Historial

Muestra eventos procesados.

Incluye:

* Fecha.
* Zona.
* Sector.
* Cultivo.
* Humedad.
* pH.
* Temperatura.
* Prioridad.
* Acción.
* Instancia que procesó.

---

### Perfil

Permite visualizar la información del usuario.

Incluye:

* Usuario.
* Wallet.
* Datos de perfil.
* Sesión.

---

# ⚙️ Backend

El backend principal es un servicio Node.js con Express.

Funciona como API central para el frontend y como puente para actualizar el estado en tiempo real.

---

## Tecnologías del backend

* Node.js.
* Express.
* Socket.IO.
* PostgreSQL Client.
* Cookie Parser.
* CORS.
* JWT.
* Dotenv.
* Nodemailer.

---

## Responsabilidades del backend

* Gestionar rutas REST.
* Recibir datos de sensores por HTTP.
* Actualizar estado global multi-zona.
* Emitir eventos por Socket.IO.
* Manejar control manual.
* Manejar modo automático.
* Consultar historial.
* Gestionar autenticación.
* Conectar con PostgreSQL.
* Servir al frontend mediante Nginx.

---

## Rutas principales

| Ruta                   | Método | Función                    |
| ---------------------- | ------ | -------------------------- |
| `/api/riego/sensores`  | POST   | Recibe datos del sensor    |
| `/api/riego/control`   | GET    | Consulta decisión de riego |
| `/api/riego/estado`    | GET    | Obtiene estado general     |
| `/api/riego/historial` | GET    | Consulta historial         |
| `/api/riego/modo`      | POST   | Cambia modo automático     |
| `/api/riego/manual`    | POST   | Control manual de bomba    |
| `/api/auth`            | Varios | Autenticación              |
| `/api/historial`       | GET    | Historial adicional        |

---

## Socket.IO en backend

El backend emite eventos en tiempo real.

Eventos principales:

* `sensor`
* `bomba`
* `estado`
* `historial`

Estos eventos actualizan las páginas del frontend sin necesidad de recargar.

---

# 📡 IoT y ESP32

El ESP32 es el dispositivo encargado de capturar lecturas físicas del entorno agrícola.

---

## Datos enviados por ESP32

```json
{
  "deviceId": "ESP32-PRINCIPAL",
  "zona": "Zona 1",
  "humedad": 15,
  "ph": 7,
  "temperatura": 23
}
```

---

## Sensores considerados

* Sensor de humedad.
* Sensor de pH.
* Sensor de temperatura.
* Módulo WiFi del ESP32.
* Relay para bomba.
* Bomba de riego.

---

## Comunicación del ESP32

El ESP32 publica mensajes al broker MQTT.

Topic principal:

```text
agrosense/sensores
```

---

## Actuadores

El sistema considera actuadores por zona.

Actuadores:

* Bomba Zona 1.
* Bomba Zona 2.
* Bomba Zona 3.
* Bomba Zona 4.

---

## Control de bombas

El microservicio Prioridad-Riego decide si la bomba debe encenderse o apagarse.

Ejemplo:

```json
{
  "zona": "Zona 1",
  "bomba": true,
  "accion": "Bomba encendida"
}
```

---

# 📊 Dashboard agrícola

El dashboard permite al operador visualizar el estado general de AgroSense.

---

## Elementos visibles

* Indicadores principales.
* Tarjetas de humedad.
* Tarjetas de pH.
* Tarjetas de temperatura.
* Estado de bomba.
* Prioridad.
* Últimas alertas.
* Historial.
* Filtros.
* Gráficas.

---

## Actualización en tiempo real

El frontend recibe eventos mediante Socket.IO.

Cuando llega una nueva lectura:

```text
Backend / Notificaciones
↓
Socket.IO
↓
Frontend
↓
Dashboard actualizado
```

---

# 🔒 Seguridad

## Seguridad de configuración

El sistema utiliza variables de entorno para proteger valores sensibles.

Ejemplos:

* Credenciales PostgreSQL.
* JWT secret.
* URL de Redis.
* URL MQTT.
* Credenciales de correo.

---

## Seguridad de comunicación

* CORS configurado.
* Cookies mediante cookie-parser.
* Separación de servicios.
* Red interna Docker.
* Nginx como punto de entrada.

---

## Seguridad Web3

* Autenticación con wallet.
* Identidad descentralizada.
* Validación de cuenta.
* Integración futura con firmas.

---

# 🐳 Docker y contenedores

AgroSense-Web3 se ejecuta mediante Docker Compose.

Cada componente del sistema corre en un contenedor independiente.

---

## Contenedores principales

```text
frontend
backend
nginx
agrosense-redis
agrosense-mqtt
recepcion-sensores-1
recepcion-sensores-2
recepcion-sensores-3
zonas-agricolas
prioridad-riego
historial-eventos
notificaciones
persistencia
agrosense-postgres-master
agrosense-postgres-replica
```

---

## Ventajas de Docker

* Reproducibilidad.
* Aislamiento.
* Portabilidad.
* Arranque rápido.
* Escalabilidad.
* Separación de responsabilidades.

---

# 📁 Estructura del proyecto

```text
Agrosense-Solana/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── historialController.js
│   │   │   └── riegoController.js
│   │   │
│   │   ├── db/
│   │   │   └── postgresClient.js
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   │
│   │   ├── models/
│   │   │   └── User.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── historialRoutes.js
│   │   │   └── riegoRoutes.js
│   │   │
│   │   ├── services/
│   │   │   ├── estadoService.js
│   │   │   └── historialService.js
│   │   │
│   │   ├── utils/
│   │   │   ├── alerts.js
│   │   │   └── mailer.js
│   │   │
│   │   ├── app.js
│   │   └── socket.js
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   ├── gestion/
│   │   │   ├── sistema/
│   │   │   ├── analitica/
│   │   │   ├── historial/
│   │   │   └── perfil/
│   │   │
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── idl/
│   │   └── utils/
│   │
│   ├── Dockerfile
│   └── package.json
│
├── services/
│   ├── recepcion-sensores/
│   │   ├── src/
│   │   │   ├── mqtt/
│   │   │   │   └── mqttClient.js
│   │   │   ├── queue/
│   │   │   │   └── sensorQueue.js
│   │   │   ├── redis/
│   │   │   │   └── redisClient.js
│   │   │   ├── validators/
│   │   │   │   └── sensorValidator.js
│   │   │   └── index.js
│   │   │
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── zonas-agricolas/
│   │   ├── src/
│   │   │   ├── grpc/
│   │   │   │   ├── grpcClient.js
│   │   │   │   └── prioridad.proto
│   │   │   ├── redis/
│   │   │   │   └── redisClient.js
│   │   │   ├── rules/
│   │   │   │   └── zoneRules.js
│   │   │   └── index.js
│   │   │
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── prioridad-riego/
│   │   ├── src/
│   │   │   ├── grpc/
│   │   │   │   ├── grpcServer.js
│   │   │   │   └── prioridad.proto
│   │   │   ├── mqtt/
│   │   │   │   └── mqttClient.js
│   │   │   ├── redis/
│   │   │   │   └── redisClient.js
│   │   │   ├── rules/
│   │   │   │   └── decisionRules.js
│   │   │   └── index.js
│   │   │
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── historial-eventos/
│   │   ├── src/
│   │   │   ├── redis/
│   │   │   │   └── redisClient.js
│   │   │   ├── storage/
│   │   │   │   └── historialStore.js
│   │   │   └── index.js
│   │   │
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── notificaciones/
│   │   ├── src/
│   │   │   ├── redis/
│   │   │   │   └── redisClient.js
│   │   │   ├── socket/
│   │   │   │   └── socketServer.js
│   │   │   └── index.js
│   │   │
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── persistencia/
│       ├── src/
│       │   ├── db/
│       │   │   └── postgresClient.js
│       │   ├── models/
│       │   │   └── sensorModel.js
│       │   ├── redis/
│       │   │   └── redisClient.js
│       │   └── index.js
│       │
│       ├── Dockerfile
│       └── package.json
│
├── postgres/
│   ├── master/
│   │   └── init-master.sh
│   └── replica/
│
├── mosquitto/
│   └── config/
│       └── mosquitto.conf
│
├── nginx/
│   └── default.conf
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

# ⚙️ Variables de entorno

## Backend `.env`

```env
PORT=3001

JWT_SECRET=super_secret

POSTGRES_HOST=postgres-master
POSTGRES_PORT=5432
POSTGRES_USER=agrosense
POSTGRES_PASSWORD=agrosense123
POSTGRES_DB=agrosense_db

EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_password_app
```

---

## Recepción-Sensores `.env`

```env
INSTANCE_ID=recepcion-sensores-1
MQTT_URL=mqtt://mosquitto:1883
MQTT_TOPIC=agrosense/sensores
MQTT_SHARED_TOPIC=$share/recepcion/agrosense/sensores
REDIS_URL=redis://redis:6379
BACKEND_RIEGO_URL=http://backend:3001/api/riego/sensores
```

---

## Zonas-Agrícolas `.env`

```env
REDIS_URL=redis://redis:6379
GRPC_PRIORIDAD_URL=prioridad-riego:50051
```

---

## Prioridad-Riego `.env`

```env
REDIS_URL=redis://redis:6379
MQTT_URL=mqtt://mosquitto:1883
```

---

## Historial-Eventos `.env`

```env
REDIS_URL=redis://redis:6379
```

---

## Notificaciones `.env`

```env
REDIS_URL=redis://redis:6379
PORT=4000
FRONTEND_URL=http://localhost:3000
```

---

## Persistencia `.env`

```env
REDIS_URL=redis://redis:6379

POSTGRES_HOST=postgres-master
POSTGRES_PORT=5432
POSTGRES_USER=agrosense
POSTGRES_PASSWORD=agrosense123
POSTGRES_DB=agrosense_db
```

---

## Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_NOTIFICACIONES_URL=http://localhost:4000
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
```

---

# 🚀 Instalación completa

## 1. Clonar repositorio

```bash
git clone https://github.com/TU_USUARIO/Agrosense-Solana.git
```

---

## 2. Entrar al proyecto

```bash
cd Agrosense-Solana
```

---

## 3. Verificar Docker

```bash
docker --version
```

---

## 4. Verificar Docker Compose

```bash
docker compose version
```

---

## 5. Construir sistema completo

```bash
docker compose up --build -d
```

---

## 6. Ver contenedores activos

```bash
docker ps
```

---

## 7. Acceder al sistema

```text
http://localhost:8080
```

---

# 📦 Ejecución con Docker

## Levantar sistema

```bash
docker compose up --build -d
```

---

## Apagar sistema

```bash
docker compose down
```

---

## Apagar y eliminar volúmenes

```bash
docker compose down -v
```

---

## Reconstrucción completa

```bash
docker compose down -v
docker compose up --build -d
```

---

## Ver logs de un servicio

```bash
docker logs backend --tail 50
```

---

## Ver logs de prioridad

```bash
docker logs prioridad-riego --tail 50
```

---

## Ver logs de zonas

```bash
docker logs zonas-agricolas --tail 50
```

---

## Ver logs de notificaciones

```bash
docker logs notificaciones --tail 50
```

---

## Ver logs de persistencia

```bash
docker logs persistencia --tail 50
```

---

# 🛰️ Flujo completo del sistema

## Flujo principal

```text
ESP32
↓
MQTT Mosquitto
↓
Recepción-Sensores
↓
Redis cola:sensores
↓
Zonas-Agrícolas
↓
gRPC
↓
Prioridad-Riego
↓
Redis cola:prioridad
↓
Historial-Eventos
↓
Redis cola:notificaciones
↓
Notificaciones
↓
Socket.IO
↓
Frontend
```

---

## Flujo de persistencia

```text
Historial-Eventos
↓
Redis cola:historial
↓
Persistencia
↓
PostgreSQL Master
↓
PostgreSQL Replica
```

---

## Flujo de riego

```text
Prioridad-Riego
↓
Evalúa humedad, pH y temperatura
↓
Decide acción
↓
Publica control MQTT
↓
Bomba por zona
```

---

# 📈 Variables monitoreadas

| Variable     | Fuente             | Uso                           |
| ------------ | ------------------ | ----------------------------- |
| Humedad      | ESP32              | Determinar necesidad de riego |
| pH           | ESP32              | Validar calidad de agua/suelo |
| Temperatura  | ESP32              | Detectar condiciones extremas |
| Zona         | ESP32 / sistema    | Ubicación lógica              |
| Sector       | Zonas-Agrícolas    | Organización agrícola         |
| Cultivo      | Zonas-Agrícolas    | Contexto productivo           |
| Prioridad    | Prioridad-Riego    | Clasificación de alerta       |
| Acción       | Prioridad-Riego    | Encender/apagar/bloquear      |
| Bomba        | Sistema de riego   | Estado del actuador           |
| Recibido por | Recepción-Sensores | Evidencia de balanceo         |
| Fecha        | Sistema            | Auditoría                     |

---

# 🧠 Lógica de prioridad

El microservicio Prioridad-Riego clasifica los eventos según humedad, pH y temperatura.

---

## Humedad

| Valor       | Nivel   | Acción            |
| ----------- | ------- | ----------------- |
| `< 30%`     | Crítica | Riego inmediato   |
| `30% - 49%` | Alta    | Riego recomendado |
| `50% - 84%` | Media   | Monitoreo         |
| `>= 85%`    | Estable | Bomba apagada     |

---

## pH

| Valor                     | Nivel   | Acción                  |
| ------------------------- | ------- | ----------------------- |
| `< 5.5` o `> 8.5`         | Crítica | Bloquear riego          |
| `5.5 - 5.9` o `8.1 - 8.5` | Alta    | Bloquear riego          |
| `6.0 - 6.4` o `7.6 - 8.0` | Media   | Permitir con precaución |
| `6.5 - 7.5`               | Estable | Permitir riego          |

---

## Temperatura

| Valor                         | Nivel   | Acción    |
| ----------------------------- | ------- | --------- |
| `< 5°C` o `> 40°C`            | Crítica | Alerta    |
| `5°C - 10°C` o `35°C - 40°C`  | Alta    | Alerta    |
| `11°C - 17°C` o `31°C - 34°C` | Media   | Monitoreo |
| `18°C - 30°C`                 | Estable | Normal    |

---

## Prioridad general

La prioridad general se calcula tomando la condición más grave.

Orden:

```text
CRÍTICA > ALTA > MEDIA > ESTABLE
```

---

## Ejemplo

```json
{
  "humedad": 15,
  "ph": 7,
  "temperatura": 23,
  "prioridad": "critica",
  "sensorOrigen": "humedad",
  "accion": "Bomba encendida"
}
```

---

# 📨 Sistema de correos

El backend puede utilizar Nodemailer para envío de correos relacionados con usuario y perfil.

Funciones consideradas:

* Verificación de usuario.
* Confirmación de cambios.
* Notificaciones administrativas.
* Recuperación de cuenta.

---

# 🧩 APIs utilizadas

## API REST Backend

El backend expone rutas REST para:

* Estado del sistema.
* Sensores.
* Control de riego.
* Historial.
* Autenticación.
* Perfil.

---

## Socket.IO

Utilizado para:

* Actualización de sensor.
* Estado de bomba.
* Estado general.
* Historial.
* Alertas.

---

## gRPC

Utilizado para:

* Evaluar prioridad.
* Comunicar zonas-agricolas con prioridad-riego.

---

## MQTT

Utilizado para:

* Recibir lecturas del ESP32.
* Enviar órdenes de control de riego.

---

# 🛠️ Tecnologías utilizadas

## Frontend

* Next.js.
* React.
* TypeScript.
* Tailwind CSS.
* Socket.IO Client.
* Recharts.
* Solana Web3.js.

---

## Backend

* Node.js.
* Express.
* Socket.IO.
* CORS.
* Cookie Parser.
* PostgreSQL Client.
* Nodemailer.
* JWT.

---

## Microservicios

* Node.js.
* Redis Client.
* MQTT Client.
* gRPC JS.
* Proto Loader.
* PostgreSQL Client.

---

## IoT

* ESP32.
* WiFi.
* MQTT.
* Sensores.
* Relay.
* Bomba.

---

## Infraestructura

* Docker.
* Docker Compose.
* Nginx.
* Redis.
* Mosquitto.
* PostgreSQL.
* PostgreSQL Replica.

---

## Blockchain

* Solana.
* Phantom Wallet.
* Web3.js.
* Anchor Framework.

---

# 🧪 Estado actual del proyecto

```text
Sistema distribuido funcional
```

---

## Actualmente implementado

* Frontend funcional.
* Backend funcional.
* Nginx funcionando en puerto 8080.
* ESP32 enviando datos por MQTT.
* MQTT Mosquitto.
* Redis como cola.
* 3 instancias de recepción-sensores.
* Zonas agrícolas.
* Prioridad-riego con gRPC.
* Historial-eventos.
* Notificaciones con Socket.IO.
* Persistencia en PostgreSQL.
* PostgreSQL master.
* PostgreSQL replica.
* Docker Compose.
* Dashboard en tiempo real.
* Gestión en tiempo real.
* Sistema en tiempo real.
* Analítica en tiempo real.
* Historial de eventos.

---

# 🛡️ Tolerancia a fallos

El sistema utiliza Redis para evitar pérdida de eventos.

Notificaciones usa:

```text
cola:notificaciones
cola:notificaciones:procesando
```

---

## Funcionamiento

1. Una alerta llega a Redis.
2. Notificaciones la mueve a cola de procesamiento.
3. Si el servicio cae, el evento queda en Redis.
4. Al reiniciar, se recuperan pendientes.
5. El evento se entrega al operador.

---

## Comandos de demostración

```bash
docker stop notificaciones
```

Enviar datos del sensor.

```bash
docker start notificaciones
```

Ver logs.

```bash
docker logs notificaciones --tail 50
```

---

# ⚖️ Balanceo de carga

El sistema utiliza tres instancias del servicio Recepción-Sensores.

```text
recepcion-sensores-1
recepcion-sensores-2
recepcion-sensores-3
```

---

## Mecanismo

Se utiliza MQTT Shared Subscription.

```text
$share/recepcion/agrosense/sensores
```

Mosquitto distribuye los mensajes entre las tres instancias.

---

## Evidencia

En el historial se muestra:

```text
Procesado por recepcion-sensores-1
Procesado por recepcion-sensores-2
Procesado por recepcion-sensores-3
```

---

# 🐘 PostgreSQL Maestro-Réplica

El sistema implementa PostgreSQL con master y réplica.

---

## Contenedores

```text
agrosense-postgres-master
agrosense-postgres-replica
```

---

## Escrituras

Las escrituras se realizan en el master.

---

## Réplica

La réplica recibe datos desde el master mediante replicación.

---

## Modelo de consistencia

El modelo utilizado es consistencia eventual.

Esto significa que una escritura se confirma primero en el master y posteriormente se replica hacia la réplica.

---

# 🔌 Comunicación gRPC

El sistema implementa gRPC entre dos microservicios:

```text
zonas-agricolas
↓
prioridad-riego
```

---

## Contrato

Archivo:

```text
prioridad.proto
```

---

## Servicio

```proto
service PrioridadService {
  rpc EvaluarPrioridad (SensorRequest)
  returns (PrioridadResponse);
}
```

---

## Request

```proto
message SensorRequest {
  string deviceId = 1;
  float humedad = 2;
  float ph = 3;
  float temperatura = 4;
  string zona = 5;
}
```

---

## Response

```proto
message PrioridadResponse {
  string prioridad = 1;
  bool bomba = 2;
  string razon = 3;
  string accion = 4;
  string sensorOrigen = 5;
  string detalle = 6;
}
```

---

# 🧾 ADR - Decisiones arquitectónicas

ADR significa Architecture Decision Record.

Son decisiones de arquitectura documentadas con contexto, alternativas, decisión y justificación.

---

## ADR-001: Uso de MQTT para comunicación IoT

### Contexto

El sistema necesita recibir datos desde dispositivos ESP32.

### Alternativas

* HTTP REST.
* MQTT.

### Decisión

Se eligió MQTT mediante Mosquitto.

### Justificación

MQTT es ligero, eficiente y adecuado para IoT.

### Consecuencias

Se requiere broker MQTT, pero se mejora la escalabilidad.

---

## ADR-002: Uso de Redis como sistema de colas

### Contexto

Los microservicios necesitan intercambiar eventos sin acoplarse directamente.

### Alternativas

* Comunicación directa.
* Redis como cola.

### Decisión

Se eligió Redis.

### Justificación

Redis permite desacoplamiento, velocidad y tolerancia a fallos.

### Consecuencias

Se agrega infraestructura, pero se gana resiliencia.

---

## ADR-003: Uso de gRPC entre Zonas-Agrícolas y Prioridad-Riego

### Contexto

Zonas-Agrícolas necesita consultar la clasificación de prioridad.

### Alternativas

* REST.
* gRPC.

### Decisión

Se eligió gRPC.

### Justificación

gRPC ofrece contrato formal mediante proto y comunicación eficiente.

### Consecuencias

Se debe mantener sincronizado el archivo prioridad.proto.

---

## ADR-004: Uso de PostgreSQL Maestro-Réplica

### Contexto

El sistema necesita almacenar eventos y permitir consultas históricas.

### Alternativas

* Base de datos única.
* PostgreSQL con réplica.

### Decisión

Se eligió PostgreSQL con master y réplica.

### Justificación

Permite separar escrituras y lecturas, además de mejorar disponibilidad.

### Consecuencias

Se debe administrar replicación y consistencia eventual.

---

# ✅ Cumplimiento de rúbrica

| Requisito                    | Estado       |
| ---------------------------- | ------------ |
| Diagrama de arquitectura     | Implementado |
| ADR documentados             | Implementado |
| 5 microservicios funcionales | Implementado |
| gRPC con contrato proto      | Implementado |
| Tolerancia a fallos          | Implementado |
| Balanceo de carga            | Implementado |
| PostgreSQL maestro-réplica   | Implementado |
| Docker Compose               | Implementado |
| README completo              | Implementado |
| Notificaciones tiempo real   | Implementado |
| Redis como cola              | Implementado |
| MQTT IoT                     | Implementado |

---

# 🧪 Pruebas recomendadas

## Ver contenedores

```bash
docker ps
```

---

## Probar backend

```bash
curl http://localhost:3001/api/riego/estado
```

---

## Enviar lectura de prueba

```bash
curl -X POST http://localhost:3001/api/riego/sensores \
-H "Content-Type: application/json" \
-d '{"deviceId":"ESP32-PRUEBA","zona":"Zona 1","humedad":15,"ph":7,"temperatura":23}'
```

---

## Revisar logs de backend

```bash
docker logs backend --tail 50
```

---

## Revisar logs de prioridad

```bash
docker logs prioridad-riego --tail 50
```

---

## Revisar logs de notificaciones

```bash
docker logs notificaciones --tail 50
```

---

## Revisar PostgreSQL

```bash
docker exec -it agrosense-postgres-master psql -U agrosense -d agrosense_db
```

---

## Ver tabla sensores

```sql
\d sensores
```

---

## Consultar últimos registros

```sql
SELECT * FROM sensores ORDER BY fecha DESC LIMIT 10;
```

---

# 🚧 Próximas mejoras

* App móvil.
* IA predictiva.
* Reportes PDF.
* Control por cultivo.
* Mejora de seguridad Web3.
* Integración IPFS.
* Consulta avanzada por fechas.
* Panel administrativo.
* Métricas de rendimiento.
* Monitoreo con Prometheus y Grafana.
* Alertas por correo.
* Alertas por WhatsApp.
* Escalamiento automático.
* Kubernetes.
* Certificados SSL.
* Roles de usuario.
* Auditoría avanzada.

---

# 🌎 Aplicaciones reales

AgroSense-Web3 puede aplicarse en:

* Invernaderos.
* Agricultura inteligente.
* Hidroponía.
* Riego tecnificado.
* Monitoreo remoto.
* Agricultura de precisión.
* Investigación académica.
* Sistemas IoT industriales.
* Centros de monitoreo agrícola.
* Automatización rural.

---

# 🏆 Enfoque Web3 y Solana

El enfoque Web3 permite extender AgroSense hacia modelos de trazabilidad agrícola descentralizada.

---

## Posibles aplicaciones Web3

* Identidad del productor.
* Registro de cultivos.
* Certificación agrícola.
* Trazabilidad de riegos.
* Registro de eventos on-chain.
* Historial descentralizado.
* Integración con NFTs agrícolas.
* Verificación de datos por wallet.

---

## ¿Por qué Solana?

* Alta velocidad.
* Bajo costo.
* Buen ecosistema.
* Compatible con aplicaciones Web3 modernas.
* Adecuada para proyectos académicos y experimentales.

---

# 👨‍💻 Autor

## Juan Alexis Velázquez Soto

Ingeniería en Sistemas Computacionales

Responsable de:

* Frontend.
* Backend.
* Microservicios.
* IoT.
* ESP32.
* Docker.
* Redis.
* MQTT.
* gRPC.
* PostgreSQL.
* Solana.
* Web3.
* Arquitectura distribuida.

---

# 📄 Licencia

Proyecto académico y experimental desarrollado con fines educativos.

---

# ⭐ Nota final

AgroSense-Web3 evolucionó desde una plataforma Web3 agrícola hacia un sistema distribuido completo capaz de integrar IoT, microservicios, colas, comunicación en tiempo real, persistencia replicada y automatización agrícola.

```text
AgroSense-Web3
Agricultura Inteligente + IoT + Web3 + Sistemas Distribuidos
```

---
