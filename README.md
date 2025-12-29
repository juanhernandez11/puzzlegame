# 🧩 Puzzle Quest - Juego de Rompecabezas Online

Un adictivo juego de puzzles deslizantes con sistema de niveles, logros y ranking global. ¡Desafía tu mente y compite con jugadores de todo el mundo!

## 🎮 Jugar Ahora

**🔗 [https://puzzlegame-tau.vercel.app](https://puzzlegame-tau.vercel.app)**

📱 **Instalar como App:** Disponible para móviles y PC

## ✨ Características

### 🎯 Gameplay
- **3 Dificultades:** 3x3, 4x4 y 5x5
- **Sistema de Niveles:** Sube de nivel ganando XP
- **Pistas Limitadas:** Usa sabiamente tus ayudas
- **Saltos Estratégicos:** Máximo 3 por sesión con criterios
- **Timer y Contador:** Rastrea tu rendimiento

### 🏆 Progresión
- **7 Logros Desbloqueables:** Desde principiante hasta maestro
- **Ranking Global:** Compite con otros jugadores
- **Sistema de Puntos:** Basado en velocidad y eficiencia
- **Progreso Persistente:** Tu avance se guarda automáticamente

### 📱 Tecnología
- **PWA (Progressive Web App):** Instalar como aplicación nativa
- **Responsive Design:** Perfecto en móviles y PC
- **Offline Ready:** Juega sin conexión después de instalar
- **SEO Optimizado:** Indexado en motores de búsqueda

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5/CSS3/JavaScript** - Interfaz moderna y responsive
- **PWA** - Service Worker para funcionalidad offline
- **Responsive Design** - Optimizado para todos los dispositivos

### Backend
- **Node.js + Express** - Servidor API REST
- **MongoDB Atlas** - Base de datos en la nube
- **JWT Authentication** - Sistema de autenticación seguro
- **bcrypt** - Encriptación de contraseñas

### Deployment
- **Vercel** - Hosting y deployment automático
- **GitHub** - Control de versiones
- **MongoDB Atlas** - Base de datos como servicio

## 🚀 Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/juanhernandez11/puzzlegame.git
cd puzzlegame

# Instalar dependencias del servidor
cd server
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MongoDB

# Ejecutar servidor
npm start

# El juego estará disponible en http://localhost:3000
```

## 🔧 Variables de Entorno

```env
PORT=3000
SECRET=tu-jwt-secret-key
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/puzzle-game
```

## 📊 Monetización

- **Google AdSense** - Anuncios integrados
- **SEO Optimizado** - Mejor visibilidad en buscadores
- **Google Search Console** - Indexación automática
- **Analytics Ready** - Preparado para métricas

## 🎯 Características del Juego

### Sistema de Puntuación
- **Puntos base:** 100 (3x3), 200 (4x4), 300 (5x5)
- **Bonus velocidad:** x2 si completas en menos de 60s
- **Bonus eficiencia:** x1.5 si usas menos movimientos
- **XP por victoria:** 50 puntos de experiencia

### Logros Disponibles
- 🏆 **Primera Victoria** - Completa tu primer puzzle
- ⚡ **Demonio Veloz** - Completa en menos de 30 segundos
- 🎯 **Eficiente** - 3x3 en menos de 20 movimientos
- ⭐ **Veterano** - Alcanza nivel 5
- 👑 **Maestro** - Completa un 5x5
- 🔥 **Rey del Combo** - Consigue combo x5
- 💎 **Perfeccionista** - Puntuación perfecta

### Sistema de Saltos
- **Límite:** 3 saltos por sesión
- **Cooldown:** 2 minutos entre saltos
- **Criterios:** Mínimo 30s jugando y 10 movimientos
- **Auto-resolución:** Cuenta como victoria

## 🔒 Seguridad

- Autenticación JWT con expiración
- Contraseñas encriptadas con bcrypt
- Validación de datos en servidor
- Protección CORS configurada

## 📱 PWA Features

- **Instalable** - Funciona como app nativa
- **Offline** - Juega sin conexión
- **Responsive** - Adaptado a todos los tamaños
- **Fast Loading** - Carga instantánea

## 🌐 SEO & Marketing

- Meta tags optimizados
- Open Graph para redes sociales
- Sitemap.xml automático
- Google Search Console integrado
- Schema markup para rich snippets

## 📈 Analytics & Monetización

- Google AdSense integrado
- Espacios publicitarios estratégicos
- Preparado para Google Analytics
- Métricas de engagement optimizadas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Juan Hernández**
- GitHub: [@juanhernandez11](https://github.com/juanhernandez11)
- Juego: [Puzzle Quest](https://puzzlegame-tau.vercel.app)

## 🙏 Agradecimientos

- Inspirado en el clásico juego de 15 puzzles
- Diseño moderno con gradientes CSS
- Iconos emoji para mejor UX
- Comunidad de desarrolladores por feedback

---

**🎮 ¡Disfruta jugando Puzzle Quest!** 

¿Te gusta el juego? ⭐ Dale una estrella al repositorio y compártelo con tus amigos.