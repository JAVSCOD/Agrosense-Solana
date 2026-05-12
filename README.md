# 🌱 AgroSense

AgroSense es una plataforma de agricultura inteligente que integra tecnologías IoT, automatización agrícola y monitoreo ambiental en tiempo real para optimizar el control y supervisión de cultivos mediante una arquitectura moderna y escalable.

El sistema combina sensores físicos conectados a un ESP32, un backend desarrollado en Node.js, un dashboard moderno construido con Next.js y una infraestructura basada en Docker.

---

# 🚀 Características principales

✅ Monitoreo de humedad del suelo en tiempo real  
✅ Monitoreo de pH del agua/suelo  
✅ Visualización de temperatura ambiental  
✅ Sistema de riego automático y manual  
✅ Dashboard interactivo con gráficas dinámicas  
✅ Historial de lecturas en tiempo real  
✅ Comunicación IoT mediante ESP32  
✅ API REST con Express  
✅ Comunicación en tiempo real con Socket.IO  
✅ Persistencia de datos con MongoDB  
✅ Proxy reverso mediante NGINX  
✅ Docker y Docker Compose  
✅ Autenticación manual + OAuth  
✅ Arquitectura escalable y modular  

---

# 🧠 Objetivo del proyecto

El objetivo de AgroSense es demostrar cómo las tecnologías IoT y automatización pueden mejorar la agricultura moderna mediante:

- 🌱 Automatización agrícola
- 📊 Monitoreo inteligente
- 📡 Supervisión remota
- 📈 Análisis en tiempo real
- 💧 Optimización del riego
- ⚙️ Escalabilidad tecnológica

---

# 🏗️ Arquitectura del sistema

```text
           ┌──────────────────┐
           │      ESP32       │
           │ Sensores IoT     │
           └────────┬─────────┘
                    │ HTTP
                    ▼
          ┌─────────────────────┐
          │   Backend Express   │
          │ Socket.IO + API     │
          └────────┬────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
 ┌──────────────┐     ┌────────────────┐
 │   MongoDB    │     │ Frontend       │
 │ Persistencia │     │ Next.js        │
 └──────────────┘     └────────────────┘
                   ▲
                   │
                 NGINX
          (Proxy reverso)
```

---

# 🧩 Tecnologías utilizadas

## 🖥️ Frontend

- Next.js
- React
- Tailwind CSS
- Recharts
- NextAuth
- TypeScript

---

## ⚙️ Backend

- Node.js
- Express
- Socket.IO
- JWT
- Cookie Parser
- CORS
- API REST

---

## 🗄️ Base de datos

- MongoDB
- Mongoose

---

## 📡 IoT

- ESP32
- Sensor de humedad
- Sensor de pH
- Relay para bomba de agua

---

## 🌐 Infraestructura

- Docker
- Docker Compose
- NGINX

---

## ☁️ APIs externas

- WeatherAPI

---

# 📁 Estructura del proyecto

```text
agrosense/
│
├── frontend/              # Dashboard web Next.js
├── backend/               # API REST + Socket.IO
├── nginx/                 # Proxy reverso
├── ESP32/                 # Código IoT
│   └── sensores.ino
│
├── docker-compose.yml
└── README.md
```

---

# ⚙️ Variables de entorno

## 🖥️ Frontend (.env.local)

```env
NEXTAUTH_URL=http://localhost:8080
NEXTAUTH_SECRET=supersecret123

NEXT_PUBLIC_WEATHER_API_KEY=TU_API_KEY
```

---

## ⚙️ Backend (.env)

```env
MONGO_URI=TU_MONGO_URI

JWT_SECRET=supersecret
```

---

# ⚙️ Instalación del proyecto

## 1️⃣ Clonar repositorio

```bash
git clone https://github.com/TU_USUARIO/agrosense.git

cd agrosense
```

---

# 🖥️ Instalación Frontend

```bash
cd frontend

npm install

npm run dev
```

📍 Disponible en:

```text
http://localhost:3000
```

---

# ⚙️ Instalación Backend

```bash
cd backend

npm install

npm run dev
```

📍 API disponible en:

```text
http://localhost:3001
```

---

## 📌 Requisitos previos

Antes de ejecutar el proyecto necesitas instalar:

- Node.js
- Docker (opcional)

---

# 🐳 Ejecución con Docker

## 1️⃣ Levantar servicios

```bash
docker compose up -d
```

---

## 2️⃣ Reconstruir contenedores

```bash
docker compose up --build -d
```

---

## 3️⃣ Apagar servicios

```bash
docker compose down
```

---

## 4️⃣ Verificar contenedores

```bash
docker ps
```

---

# 🌐 Acceso al sistema

## Frontend

```text
http://localhost:8080
```

---

## Backend API

```text
http://localhost:3001
```

---

# 📡 Funcionamiento del ESP32

El ESP32:

1. Se conecta a una red WiFi
2. Lee sensores físicos
3. Envía datos al backend mediante HTTP
4. Consulta el estado del riego
5. Activa o desactiva la bomba mediante relay

---

# 📊 Variables monitoreadas

| Variable     | Fuente        |
| ------------ | ------------- |
| Humedad      | Sensor ESP32  |
| pH           | Sensor ESP32  |
| Temperatura  | WeatherAPI    |
| Estado bomba | Backend       |

---

# 🔄 Flujo de funcionamiento

1. Los sensores físicos recopilan datos.
2. El ESP32 envía la información al backend.
3. El backend procesa las métricas.
4. Los datos se almacenan en MongoDB.
5. El frontend consume la API.
6. El dashboard muestra métricas en tiempo real.

---

# 📊 Funcionalidades implementadas

## ✅ Implementadas

- Login manual
- Login con Google
- Login con GitHub
- Dashboard dinámico
- Gráficas en tiempo real
- Simulación de sensores
- Integración ESP32
- Riego automático
- Control manual de bomba
- Historial de sensores
- Socket.IO en tiempo real
- API REST funcional
- MongoDB persistente
- Docker funcional
- NGINX funcional

---

# 🔒 Seguridad

- JWT Authentication
- Cookies HTTPOnly
- OAuth con Google/GitHub
- Variables de entorno protegidas
- Middleware de autenticación
- Arquitectura desacoplada

---

# 🚧 Próximas mejoras

- 📡 Sensores físicos avanzados
- 🌡️ Sensor de temperatura físico
- 🤖 IA para predicción de riego
- 📱 Aplicación móvil
- ☁️ Deploy en nube
- 🌍 Multi-zonas agrícolas
- 📈 Sistema inteligente de alertas
- 📊 Exportación de métricas
- 🌦️ Integración climática avanzada

---

# 🎯 Aplicaciones del proyecto

AgroSense puede utilizarse en:

- Agricultura inteligente
- Invernaderos automatizados
- Sistemas de riego inteligentes
- Monitoreo remoto agrícola
- Investigación tecnológica

---

# 👨‍💻 Autor

## Juan Alexis Velázquez

Proyecto académico y experimental orientado a:

- 🌱 Agricultura inteligente
- 📡 IoT
- ☁️ Infraestructura web moderna

---

# 🏆 Proyecto tipo Hackathon

AgroSense combina tecnologías modernas como:

- 🌱 Smart Farming
- 📡 Internet de las Cosas (IoT)
- ☁️ Arquitectura Web
- 📊 Visualización de datos
- 🤖 Automatización agrícola

---

# ⚠️ Notas importantes

- Configurar correctamente variables de entorno
- Mantener ESP32 y servidor en la misma red
- Proyecto en desarrollo

---

# ⭐ Recomendación para ESP32

Si utilizas hotspot móvil:

```bash
hostname -I
```

Actualizar la IP del backend dentro del ESP32 cuando cambie la red.

---

# 📬 Contribuciones

Las contribuciones son bienvenidas:

1. Haz un Fork 🍴
2. Crea una nueva rama 🌿
3. Realiza tus cambios
4. Envía un Pull Request 🚀

---

# ⭐ Apóyalo

Si te gusta el proyecto:

⭐ Dale una estrella en GitHub

---

# 📄 Licencia

Proyecto de uso académico, educativo y experimental.

