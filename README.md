# ✨ Versos que Impactan

Generador automático de **videos verticales (9:16) con mensajes cristianos poderosos** para Instagram Reels, TikTok, Facebook y X. Se siente como un mensaje personal de Dios: voz masculina ultra realista en español latino, paisajes cinematográficos, texto animado estilo CapCut sincronizado palabra por palabra con la voz, avatar con lip sync, música emotiva y marca de agua elegante — **todo generado con un solo clic**.

Inspirado en el estilo de @pastorleolopez, @oracionconia, @palabrasdelcreador5 y @devocionesadios.

---

## 🏗️ Arquitectura

**El truco central**: la vista previa y el MP4 final usan **exactamente la misma composición de Remotion**. Lo que ves en el navegador (`@remotion/player`) es, píxel por píxel, lo que se renderiza en el servidor (`@remotion/renderer`) como MP4 H.264 en 1080×1920.

```
Usuario elige tema/duración ──► POST /api/generate (pipeline de un clic)
                                    │
      ┌─────────────────────────────┼──────────────────────────┐
      ▼                             ▼                          ▼
 1. GUION (Claude)          2. VOZ (ElevenLabs)         3. FONDO (Pexels/IA)
 versículo + reflexión      mp3 + timestamps            video vertical
 calibrados a la duración   por palabra                 cinematográfico
      │                             │                          │
      └──────────────┬──────────────┘                          │
                     ▼                                         │
          4. LIP SYNC (D-ID)  ◄── audio público (Supabase)     │
                     │                                         │
                     └────────────────┬────────────────────────┘
                                      ▼
                        VideoProject (JSON con todos los assets)
                                      │
                 ┌────────────────────┴───────────────────┐
                 ▼                                        ▼
      Vista previa en tiempo real              POST /api/render
      (@remotion/player en el navegador)       MP4 1080×1920 H.264 (CRF 18)
```

**Degradación elegante**: cada etapa funciona sin su API key (modo demo) — banco curado de versículos, timestamps estimados, fondo animado de cielo con estrellas. La app **nunca** falla por falta de claves; cada clave desbloquea una capacidad.

## 📁 Estructura del proyecto

```
versosqueimpactan/
├── app/
│   ├── layout.tsx                  # Layout global (dark mode, navbar, footer)
│   ├── globals.css                 # Tema oscuro elegante (azul noche + oro)
│   ├── page.tsx                    # 🏠 INICIO — landing con hero y features
│   ├── generador/page.tsx          # 🎬 GENERADOR — creación en un clic
│   ├── preview/[id]/
│   │   ├── page.tsx                # 👁️ VISTA PREVIA — player + descarga
│   │   └── preview-client.tsx
│   ├── historial/page.tsx          # 🗂️ HISTORIAL — galería de videos
│   └── api/
│       ├── generate/route.ts       # Pipeline completo de generación
│       └── render/route.ts         # Render MP4 1080p con Remotion
├── components/
│   ├── ui/                         # shadcn/ui: button, card, select, slider…
│   ├── layout/                     # navbar, footer
│   ├── generator/                  # formulario, progreso, marca de agua
│   ├── preview/                    # player, botón de descarga, regenerar
│   └── historial/                  # galería
├── lib/
│   ├── types.ts                    # Tipos del dominio (VideoProject, etc.)
│   ├── constants.ts                # Temas, duraciones, voces, estilos, paisajes
│   ├── pipeline.ts                 # 🧠 Orquestador de generación
│   ├── verse-bank.ts               # Banco curado de versículos (demo/fallback)
│   ├── store.ts                    # Historial (zustand + localStorage)
│   ├── ai/
│   │   ├── anthropic.ts            # Claude: versículo + reflexión
│   │   ├── elevenlabs.ts           # Voz + timestamps por palabra
│   │   ├── did.ts                  # Lip sync (D-ID Talks)
│   │   └── pexels.ts               # Fondos verticales cinematográficos
│   └── supabase/                   # Clientes browser/admin + Storage
├── remotion/
│   ├── VerseVideo.tsx              # 🎥 Composición principal 1080×1920
│   ├── Captions.tsx                # Karaoke sincronizado (estilo CapCut)
│   ├── Background.tsx              # Paisaje + Ken Burns + viñeta
│   ├── Watermark.tsx               # @usuario + logos de redes (SVG inline)
│   └── index.ts                    # Entry para el render en servidor
├── supabase/schema.sql             # Tabla projects + RLS + bucket media
└── .env.example                    # Todas las variables documentadas
```

## 🚀 Instalación

```bash
# 1. Clona e instala
git clone <repo>
cd versosqueimpactan
npm install

# 2. Configura las variables de entorno
cp .env.example .env.local
# → edita .env.local con tus claves (ver siguiente sección)

# 3. Arranca
npm run dev
# → http://localhost:3000
```

> **Funciona sin claves**: la app arranca en modo demo con versículos curados y fondo animado. Configura las APIs una por una para desbloquear voz real, paisajes y lip sync.

## 🔑 Configuración de APIs (paso a paso)

### 1. Claude (guion inteligente) — `ANTHROPIC_API_KEY`

1. Crea una cuenta en [console.anthropic.com](https://console.anthropic.com) → **API Keys** → crea una clave.
2. Pégala en `.env.local`.
3. Claude elige el versículo perfecto para el tema, redacta una reflexión pastoral y **calibra el número de palabras exactamente a la duración elegida** (a ~2.1 palabras/segundo de narración pausada).

### ⭐ Voz GRATIS y sin clave (por defecto) — Microsoft Edge TTS

**No necesitas configurar nada para tener voz realista.** La app usa por
defecto las voces neuronales de Microsoft (las mismas de Azure, vía el canal
gratuito de "Leer en voz alta" de Edge): `es-MX-JorgeNeural`, `es-US-AlonsoNeural`
y `es-CO-GonzaloNeural` — voces masculinas cálidas en español latino. Además
devuelven los tiempos por palabra, así que los subtítulos karaoke quedan
sincronizados sin trabajo extra. Si Edge no está disponible, la app recurre a
Google Translate TTS (también gratis y sin clave). Todo esto vive en
`lib/ai/free-tts.ts` y `lib/ai/voice.ts`, sin requerir cuenta ni tarjeta.

### 2. ElevenLabs (voz premium, OPCIONAL) — `ELEVENLABS_API_KEY`

1. Cuenta en [elevenlabs.io](https://elevenlabs.io) (el plan Starter de $5/mes alcanza para empezar; el Creator de $22/mes da ~100 min de audio).
2. **Profile → API Keys** → copia tu clave.
3. Elige la voz en **Voices → Voice Library**: busca `spanish latin american male deep` y filtra por *narrative*. Prueba varias y copia el **Voice ID** de tu favorita. Busca voces etiquetadas como "cálida", "profunda" o "narración".
4. La app usa el modelo `eleven_multilingual_v2` con `stability: 0.45` y `style: 0.35` — configuración probada para tono **emotivo y cálido** (más estabilidad = más monótono; menos = más dramático).
5. **Clave técnica**: usamos el endpoint `with-timestamps`, que devuelve la alineación por caracteres → la convertimos a timestamps por palabra → los subtítulos karaoke quedan **perfectamente sincronizados con la voz**, sin transcripción adicional.

### 3. D-ID (lip sync / avatar hablando) — `DID_API_KEY` + `DID_AVATAR_IMAGE_URL`

1. Cuenta en [d-id.com](https://www.d-id.com) → **API** (trial con créditos gratis; luego ~$0.10–0.30 por video corto).
2. Copia tu API key (formato `usuario:clave` en Basic auth — la app lo arma sola).
3. Sube una **foto de rostro realista** (frontal, buena luz, fondo neutro) a un URL público — puede ser el bucket `media` de Supabase — y ponla en `DID_AVATAR_IMAGE_URL`.
4. **Requisito**: D-ID necesita que el mp3 de la voz esté en un **URL público**, por eso el pipeline sube el audio a Supabase Storage automáticamente (configura Supabase primero).
5. El avatar aparece como burbuja circular con borde dorado en la esquina inferior derecha, hablando el versículo con sincronización labial.

**Alternativa — HeyGen**: si prefieres avatares de cuerpo completo, usa la [HeyGen API](https://docs.heygen.com) (`/v2/video/generate` con `voice: { type: "audio", audio_url }`). La interfaz de `lib/ai/did.ts` es fácil de intercambiar: devuelve `avatarVideoUrl`.

### 4. Pexels (fondos cinematográficos gratis) — `PEXELS_API_KEY`

1. [pexels.com/api](https://www.pexels.com/api/) → clave gratuita instantánea (200 req/hora).
2. La app busca videos **verticales** de paisajes según la categoría elegida (montañas al amanecer, océano dorado, cielo estrellado…) y elige el archivo más cercano a 1080×1920.

**Upgrade — fondos generados con IA**: para paisajes únicos usa Runway Gen-3 (`RUNWAY_API_KEY`), Kling AI o Luma Dream Machine. Recomendación práctica: genera 20–30 clips de 10s por categoría **una sola vez**, súbelos a Supabase Storage y rota entre ellos — calidad IA sin pagar por video generado en cada uso.

### 5. Supabase (auth + historial en la nube + storage)

1. Proyecto gratis en [supabase.com](https://supabase.com).
2. **Settings → API**: copia `URL`, `anon key` y `service_role key` a `.env.local`.
3. **SQL Editor**: pega y ejecuta `supabase/schema.sql` (crea la tabla `projects` con Row Level Security y el bucket público `media`).
4. **Authentication → Providers**: habilita Email (magic link) y/o Google.

> Sin Supabase, el historial vive en `localStorage` del navegador (hasta 30 videos) — perfecto para probar.

### 6. Música de fondo — `NEXT_PUBLIC_MUSIC_URL`

Consigue instrumentales cristianos emotivos **con licencia** (Artlist, Epidemic Sound, o los géneros *worship/cinematic* de Pixabay Music que son gratis). Súbelos a `public/music/` o a Supabase Storage y pon el URL en la variable. La música **hace loop automático a la duración del video**, baja al 14% cuando habla la voz (ducking) y termina con fade out.

## 🎬 Render y descarga (MP4 1080×1920)

El botón **Descargar** llama a `/api/render`, que renderiza la composición con Remotion en el servidor (H.264, CRF 18 ≈ visualmente sin pérdida).

- **Local / VPS / Railway / Fly.io / Render.com**: funciona tal cual — Remotion descarga Chrome headless automáticamente la primera vez.
- **Vercel**: las funciones serverless no aguantan renders largos. Usa [Remotion Lambda](https://www.remotion.dev/docs/lambda): renderiza en AWS Lambda en segundos (paraleliza por chunks) y devuelve un URL de S3. Cambia `/api/render` por `renderMediaOnLambda()` — la composición no cambia.
- **Licencia**: Remotion es gratis para individuos y empresas ≤3 personas; empresas mayores necesitan [licencia de empresa](https://remotion.pro).

## ⚡ Optimización de calidad y velocidad

**Calidad**
- **Voz**: `eleven_multilingual_v2` > `eleven_turbo_v2_5` en emotividad. Sube `style` a 0.5 para más drama; usa pausas con `…` y comas en el guion (Claude ya lo hace).
- **Video**: CRF 18 + `jpegQuality: 90` ya es alta calidad. Para máxima nitidez usa `crf: 16` (archivo ~40% más grande). Los fondos de Pexels se piden en la resolución más cercana a 1080×1920 para no re-escalar.
- **Tipografía**: instala [`@remotion/google-fonts`](https://www.remotion.dev/docs/google-fonts) para garantizar que Playfair Display/Montserrat carguen antes del primer frame en el render de servidor.

**Velocidad**
- El pipeline ya corre **voz y fondo en paralelo** (`Promise.all`).
- El **bundle de Remotion se cachea por proceso** — el primer render tarda ~30s extra, los siguientes no.
- `concurrency` de `renderMedia` escala con los cores del servidor; en Remotion Lambda un video de 60s renderiza en ~15–20s.
- El lip sync de D-ID es lo más lento (30–90s). Genera el avatar **en paralelo** con una cola (BullMQ / Inngest / Trigger.dev) y muestra la vista previa sin avatar mientras tanto.
- Cachea fondos de Pexels por categoría en Supabase para ahorrar llamadas.

## 🔮 Mejoras futuras sugeridas

1. **Cola de renders asíncrona** (Inngest/Trigger.dev): el usuario recibe notificación cuando su MP4 está listo, en vez de esperar.
2. **Subtítulos por sílaba y efectos de partículas** (destellos dorados al resaltar palabras) para acercarse aún más a CapCut premium.
3. **Publicación directa** a Instagram/TikTok/YouTube vía sus APIs oficiales (Meta Graph API, TikTok Content Posting API).
4. **Series y calendario**: generar 7 videos de un tema ("7 días de esperanza") y programar publicaciones.
5. **Clonación de voz**: que el pastor/creador clone su propia voz en ElevenLabs (Professional Voice Cloning) para mensajes 100% personales.
6. **Avatares consistentes**: personaje propio generado con Flux/Midjourney + HeyGen Avatar para identidad de marca.
7. **Métricas**: guardar qué temas/estilos generan más descargas y sugerir "lo que más impacta".
8. **Monetización**: plan gratuito con marca de agua de la app; plan pro sin marca, con 4K y voces premium (Stripe + Supabase).
9. **Modo oración**: videos más largos (3–5 min) de oración guiada con respiración y música ambiental.
10. **App móvil** (Expo/React Native) reutilizando las mismas APIs.

## 🧰 Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui |
| Video | Remotion 4 (Player para preview + Renderer para MP4) |
| Guion IA | Claude (Anthropic) |
| Voz | ElevenLabs `eleven_multilingual_v2` con timestamps |
| Lip sync | D-ID Talks (alternativa: HeyGen) |
| Fondos | Pexels Videos (upgrade: Runway Gen-3 / Kling / Luma) |
| Backend | Supabase (Postgres + RLS + Storage + Auth) |
| Estado | Zustand con persistencia en localStorage |

---

*"Y estas palabras que yo te mando hoy, estarán sobre tu corazón" — Deuteronomio 6:6*
