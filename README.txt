MI IPTV — ADD-ON PERSONAL PARA STREMIO

Este ZIP contiene el código fuente de un add-on sencillo que lee una lista M3U propia y presenta sus canales como catálogo de TV en Stremio.

IMPORTANTE: el ZIP NO se instala directamente en Stremio. Hay que desplegarlo en un servicio que ejecute Node.js y proporcione una dirección HTTPS pública.

CONFIGURACIÓN DEL DESPLIEGUE
1. Sube el contenido de este ZIP a un servicio de alojamiento compatible con Node.js (Node 18 o superior).
2. Configura la variable de entorno M3U_URL con la URL HTTPS de tu lista M3U.
3. Comando de inicio: npm start
4. Cuando el servicio esté activo, abre https://TU-DOMINIO/manifest.json en Stremio para instalar el add-on.

La lista M3U no se incluye en este ZIP. No se ha podido incrustar porque la URL original no aparece en el contexto disponible para generar este paquete.

LIMITACIONES
- Lee enlaces HTTP/HTTPS que aparezcan en la M3U.
- La guía EPG XMLTV todavía no está implementada.
- La compatibilidad de reproducción depende de los formatos y códecs admitidos por Stremio y el dispositivo.
- Mantén privada la URL M3U si contiene credenciales o un token personal.
