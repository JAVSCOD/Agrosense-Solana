<div align="center">

# 🌱 AgroSense-Web3

### 🚀 Plataforma Inteligente de Agricultura + IoT + Blockchain Solana

Monitoreo agrícola en tiempo real, automatización de riego e identidad Web3 utilizando Solana.

---

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Solana](https://img.shields.io/badge/Solana-Web3-9945FF?style=for-the-badge&logo=solana&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![ESP32](https://img.shields.io/badge/ESP32-IoT-E7352C?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

---

### 🌾 Agricultura Inteligente • 🔗 Web3 • 📡 IoT • ⚡ Solana

</div>

---

# 📚 Índice

- [📖 Descripción general](#-descripción-general)
- [🎯 Objetivo del proyecto](#-objetivo-del-proyecto)
- [🚨 Problemática](#-problemática)
- [💡 Solución propuesta](#-solución-propuesta)
- [🧠 ¿Qué hace AgroSense-Web3?](#-qué-hace-agrosense-web3)
- [🏗️ Arquitectura general](#️-arquitectura-general)
- [🔗 Integración Blockchain Solana](#-integración-blockchain-solana)
- [🧬 Funcionamiento Web3](#-funcionamiento-web3)
- [🌐 Frontend](#-frontend)
- [⚙️ Backend](#️-backend)
- [📡 IoT y ESP32](#-iot-y-esp32)
- [📊 Dashboard agrícola](#-dashboard-agrícola)
- [🔒 Seguridad](#-seguridad)
- [🐳 Docker y contenedores](#-docker-y-contenedores)
- [📁 Estructura del proyecto](#-estructura-del-proyecto)
- [⚙️ Variables de entorno](#️-variables-de-entorno)
- [🚀 Instalación completa](#-instalación-completa)
- [📦 Ejecución con Docker](#-ejecución-con-docker)
- [🛰️ Flujo completo del sistema](#️-flujo-completo-del-sistema)
- [📈 Variables monitoreadas](#-variables-monitoreadas)
- [📨 Sistema de correos](#-sistema-de-correos)
- [🧩 APIs utilizadas](#-apis-utilizadas)
- [🛠️ Tecnologías utilizadas](#️-tecnologías-utilizadas)
- [🧪 Estado actual del proyecto](#-estado-actual-del-proyecto)
- [🚧 Próximas mejoras](#-próximas-mejoras)
- [🌎 Aplicaciones reales](#-aplicaciones-reales)
- [🏆 Enfoque Web3 y Solana](#-enfoque-web3-y-solana)
- [👨‍💻 Autor](#-autor)
- [📄 Licencia](#-licencia)

---
# 📖 Descripción general

## 🌱 ¿Qué es AgroSense-Web3?

AgroSense-Web3 es una plataforma de agricultura inteligente que combina:

* Internet de las Cosas (IoT)
* Automatización agrícola
* Blockchain Solana
* Dashboards web interactivos
* Sensores físicos
* Web3 Authentication
* Smart Contracts

El sistema fue desarrollado con el objetivo de modernizar el monitoreo agrícola mediante una solución tecnológica capaz de:

✅ Monitorear cultivos en tiempo real
✅ Automatizar procesos de riego
✅ Analizar variables ambientales
✅ Utilizar identidad descentralizada Web3
✅ Integrar blockchain en agricultura
✅ Mejorar el uso eficiente del agua
✅ Visualizar métricas agrícolas desde cualquier lugar

---

# 🎯 Objetivo del proyecto

El objetivo principal de AgroSense-Web3 es demostrar cómo la integración entre:

* Agricultura
* IoT
* Automatización
* Blockchain
* Web3

puede crear una solución moderna, escalable y eficiente para el sector agrícola.

---

# 🚨 Problemática

Muchos sistemas agrícolas tradicionales presentan problemas como:

* Uso ineficiente del agua
* Falta de monitoreo en tiempo real
* Ausencia de automatización
* Dependencia de supervisión manual
* Información descentralizada
* Poca trazabilidad de datos
* Infraestructura tecnológica limitada

Además, la mayoría de plataformas agrícolas actuales dependen completamente de sistemas centralizados.

---

# 💡 Solución propuesta

AgroSense-Web3 propone una plataforma que integra:

## 🌐 Web3 + IoT + Automatización

permitiendo:

* Monitorear sensores agrícolas
* Visualizar métricas en tiempo real
* Automatizar decisiones de riego
* Gestionar usuarios mediante Phantom Wallet
* Registrar información en Solana
* Crear una identidad agrícola descentralizada

---

# 🧠 ¿Qué hace AgroSense-Web3?

El sistema permite:

## 👤 Gestión Web3 de usuarios

* Registro de usuario
* Login Web3
* Actualización de perfil
* Identidad descentralizada

---

## 🌡️ Monitoreo agrícola

* Humedad del suelo
* Temperatura ambiental
* pH del agua/suelo
* Estado del sistema

---

## 💧 Automatización de riego

* Activación manual
* Activación automática
* Lógica inteligente
* Control mediante ESP32

---

## 📊 Dashboard interactivo

* Historial de sensores
* Visualización en tiempo real
* Gráficas dinámicas
* Alertas visuales

---

## 🔗 Blockchain Solana

* Phantom Wallet
* Anchor Framework
* PDAs
* Smart contracts
* Verificación on-chain

---

# 🏗️ Arquitectura general

```text
                    ┌────────────────────┐
                    │       ESP32        │
                    │ Sensores IoT       │
                    │ Humedad / pH       │
                    └─────────┬──────────┘
                              │
                              │ HTTP
                              ▼
                    ┌────────────────────┐
                    │ Backend Express    │
                    │ API REST           │
                    │ Socket.IO          │
                    │ Nodemailer         │
                    └─────────┬──────────┘
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
      ┌──────────────────┐        ┌──────────────────┐
      │ Dashboard Web    │        │ Sistema IoT      │
      │ Next.js          │        │ Riego inteligente│
      └─────────┬────────┘        └──────────────────┘
                │
                │ Web3
                ▼
      ┌───────────────────────┐
      │ Phantom Wallet        │
      └─────────┬─────────────┘
                │
                ▼
      ┌───────────────────────┐
      │ Solana Devnet         │
      │ Anchor Program        │
      │ PDA UserAccount       │
      └───────────────────────┘
```

---

# 🔗 Integración Blockchain Solana

AgroSense-Web3 utiliza Solana como infraestructura principal Web3.

---

## 🔥 Funcionalidades blockchain

### ✅ Conexión Phantom Wallet

El usuario puede autenticarse mediante su wallet.

---

### ✅ Registro on-chain

Los datos del usuario son almacenados en una cuenta PDA dentro de Solana.

---

### ✅ Login Web3

El sistema verifica si existe la cuenta PDA.

---

### ✅ Actualización de perfil

El perfil del usuario puede modificarse directamente desde blockchain.

---

### ✅ PDAs (Program Derived Addresses)

Cada usuario tiene una cuenta única derivada mediante seeds.

---

# 🧬 Funcionamiento Web3

---

# 📝 Registro

```text
Usuario llena formulario
↓
Recibe código por correo
↓
Verifica código
↓
Conecta Phantom Wallet
↓
Se crea PDA en Solana
↓
Se guarda sesión Web3
↓
Acceso al dashboard
```

---

# 🔑 Login

```text
Usuario conecta Phantom Wallet
↓
Frontend calcula PDA
↓
Consulta Solana
↓
Si existe:
    acceso permitido
Si no existe:
    redirección a registro
```

---

# 👤 Actualización de perfil

```text
Usuario modifica datos
↓
Frontend conserva valores originales
↓
Anchor ejecuta update_profile
↓
Solana actualiza PDA
↓
Frontend actualiza sesión
↓
Backend envía correo de confirmación
```

---

# 🌐 Frontend

El frontend fue desarrollado con:

* Next.js
* React
* TypeScript
* Tailwind CSS

---

## 📌 Funciones principales

### Dashboard agrícola

Visualización de sensores y métricas.

### Login Web3

Conexión mediante Phantom Wallet.

### Sidebar interactivo

Sistema modular de navegación.

### Gestión de perfil

Edición dinámica de información.

### Diseño responsivo

Compatible con desktop y futuras versiones móviles.

---

# ⚙️ Backend

El backend fue desarrollado utilizando:

* Node.js
* Express
* Socket.IO
* Nodemailer
* MongoDB
* CORS
* JWT

---

## 📌 Responsabilidades del backend

### API REST

Manejo de peticiones del frontend.

### Comunicación IoT

Recepción de datos del ESP32.

### Envío de correos

Verificación y notificaciones.

### Socket.IO

Actualización en tiempo real.

### Integración MongoDB

Almacenamiento de sensores y datos auxiliares.

---

# 📡 IoT y ESP32

El ESP32 es el microcontrolador principal del sistema IoT.

---

## 🔌 Funciones del ESP32

* Leer sensores
* Enviar datos al backend
* Activar bomba de agua
* Automatizar riego
* Conectarse vía WiFi

---

## 🌡️ Sensores utilizados

### Sensor de humedad capacitivo

Determina el nivel de humedad del suelo.

### Sensor de pH

Evalúa calidad del agua/suelo.

### Sensor de temperatura

Se complementa mediante WeatherAPI.

---

# 📊 Dashboard agrícola

El dashboard permite:

✅ Ver sensores en tiempo real
✅ Consultar historial
✅ Analizar gráficas
✅ Visualizar estado de riego
✅ Administrar perfil
✅ Monitorear sistema

---

# 🔒 Seguridad

## 🔐 Seguridad Web3

* Wallet Authentication
* Validación PDA
* Identidad descentralizada

---

## 🔐 Seguridad Backend

* Variables `.env`
* JWT
* Validación de rutas
* CORS
* Cookies seguras

---

## 🔐 Seguridad Blockchain

* Solana PDAs
* Anchor validation
* Cuentas derivadas
* Firmas criptográficas

---

# 🐳 Docker y contenedores

El proyecto utiliza Docker para facilitar:

* despliegue,
* desarrollo,
* portabilidad,
* contenedores independientes.

---

# 📦 Servicios Docker

## Frontend

```text
Puerto 3000
```

---

## Backend

```text
Puerto 3001
```

---

## NGINX

```text
Puerto 8080
```

---

# 📁 Estructura del proyecto

```text
agrosense-solana/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── idl/
│   │   └── utils/
│   │
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── socket.js
│   │   └── app.js
│   │
│   ├── .env
│   ├── package.json
│   └── Dockerfile
│
├── nginx/
│   └── default.conf
│
├── docker-compose.yml
│
└── README.md
```

---

# ⚙️ Variables de entorno

# Backend `.env`

```env
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_password_app
MONGO_URI=tu_uri_mongodb
JWT_SECRET=super_secret
```

---

# Frontend `.env.local`

```env
NEXT_PUBLIC_WEATHER_API_KEY=tu_api_key
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
```

---

# 🚀 Instalación completa

# 1️⃣ Clonar repositorio

```bash
git clone https://github.com/TU_USUARIO/agrosense-web3.git
```

---

# 2️⃣ Entrar al proyecto

```bash
cd agrosense-web3
```

---

# 3️⃣ Instalar frontend

```bash
cd frontend
npm install
```

---

# 4️⃣ Instalar backend

```bash
cd ../backend
npm install
```

---

# 5️⃣ Ejecutar frontend

```bash
npm run dev
```

---

# 6️⃣ Ejecutar backend

```bash
npm run dev
```

---

# 📦 Ejecución con Docker

---

# Construir contenedores

```bash
docker compose up --build -d
```

---

# Ver contenedores

```bash
docker ps
```

---

# Apagar contenedores

```bash
docker compose down
```

---

# Reconstrucción completa

```bash
docker compose down

docker compose up --build -d
```

---

# 🛰️ Flujo completo del sistema

```text
Sensores físicos
↓
ESP32
↓
Backend Express
↓
Socket.IO
↓
Dashboard Next.js
↓
Usuario Web3
↓
Phantom Wallet
↓
Solana PDA
```

---

# 📈 Variables monitoreadas

| Variable     | Fuente            | Uso                |
| ------------ | ----------------- | ------------------ |
| Humedad      | Sensor capacitivo | Automatización     |
| pH           | Sensor pH         | Calidad agrícola   |
| Temperatura  | WeatherAPI        | Contexto climático |
| Estado bomba | ESP32             | Riego              |
| Usuario      | Solana PDA        | Identidad          |

---

# 📨 Sistema de correos

El backend utiliza Nodemailer para:

* Verificación de usuario
* Confirmación de cambios
* Alertas futuras
* Validación de códigos

---

# 🧩 APIs utilizadas

## 🌦️ WeatherAPI

Obtención de:

* temperatura,
* humedad,
* clima.

---

# 🛠️ Tecnologías utilizadas

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Recharts

---

## Backend

* Node.js
* Express
* Socket.IO
* Nodemailer
* MongoDB

---

## Blockchain

* Solana
* Anchor
* Phantom Wallet
* Web3.js

---

## IoT

* ESP32
* Sensores
* Relay

---

## Infraestructura

* Docker
* Docker Compose
* NGINX

---

# 🧪 Estado actual del proyecto

```text
MVP funcional Web3 + IoT
```

---

# ✅ Actualmente implementado

* Login Web3
* Registro Web3
* Dashboard
* Solana PDA
* Perfil editable
* Docker
* NGINX
* Socket.IO
* WeatherAPI
* Sistema IoT base
* MongoDB
* Correos automáticos

---

# 🚧 Próximas mejoras

* IA predictiva
* Multi-zonas agrícolas
* App móvil
* IPFS
* NFTs agrícolas
* Alertas inteligentes
* Blockchain de sensores
* Automatización avanzada

---

# 🌎 Aplicaciones reales

AgroSense-Web3 puede aplicarse en:

* Agricultura inteligente
* Invernaderos
* Sistemas hidropónicos
* Monitoreo remoto
* Automatización agrícola
* Investigación IoT
* Web3 agrícola

---

# 🏆 Enfoque Web3 y Solana

El proyecto busca demostrar cómo Solana puede integrarse con sistemas físicos reales.

---

## ¿Por qué Solana?

* Transacciones rápidas
* Bajo costo
* Escalabilidad
* Integración sencilla
* Excelente ecosistema Web3

---

# 👨‍💻 Autor

# Juan Alexis Velázquez Soto

## Full Stack & Blockchain Developer

Responsable de:

* Frontend
* Backend
* Solana
* Smart Contracts
* Anchor
* IoT
* ESP32
* Docker
* Arquitectura Web3

---

# 📄 Licencia

Proyecto académico y experimental.

---

# ⭐ Apóyalo

Si el proyecto te parece interesante:

```text
⭐ Dale una estrella en GitHub
```

---

# 🌱 AgroSense-Web3

## Agricultura inteligente impulsada por IoT + Blockchain + Solana 🚀
