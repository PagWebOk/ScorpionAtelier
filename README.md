# Scorpion Atelier

Landing page de **Scorpion Atelier**, relojería artesanal de nicho. Relojes hechos a mano por Paulo, joyero de oficio: cajas de metal en bruto, diales dorados calados con numerales romanos y movimiento Miyota serie 8000.

Sitio estático: HTML, CSS y JavaScript sin dependencias ni proceso de compilación.

## Estructura

```
├── index.html          Página principal
├── css/styles.css      Estilos (paleta, tipografía, diseño responsive)
├── js/main.js          Mesa de trabajo en canvas, galería, formulario
└── assets/             Imágenes, logo y video del taller
```

## Ver en local

Abrir `index.html` con doble clic en el navegador. No necesita servidor.

## Publicar con GitHub Pages

1. En el repositorio: **Settings → Pages**.
2. En *Source* elegir **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. Guardar. El sitio queda en `https://<usuario>.github.io/<repositorio>/` en uno o dos minutos.

Para usar un dominio propio, escribirlo en **Settings → Pages → Custom domain** y configurar el DNS como indica GitHub.

## Pendientes antes de publicar en serio

- **Formulario de contacto:** envía las consultas a paulomel99@icloud.com mediante FormSubmit (`endpoint` en `js/main.js`). La primera consulta dispara un mail de activación que hay que confirmar una sola vez.
- **Imagen para redes sociales:** en `index.html`, cambiar `og:image` por la URL completa del sitio (por ejemplo `https://scorpionatelier.com/assets/render-diseno.jpg`) para que WhatsApp e Instagram muestren la vista previa.
- **Textos del proceso:** revisar los seis pasos de "Cómo se hace una pieza" con el proceso real del taller.

## Créditos

Fotos y video: taller de Scorpion Atelier. Tipografías: Cinzel, Jost e IBM Plex Mono (Google Fonts).
