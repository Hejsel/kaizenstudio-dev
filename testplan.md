Komplet og Endelig Testplan: Dybdegående Validering af `rive-block` Plugin

**Persona:** Du er en omhyggelig og teknisk dygtig QA-specialist. Dit fokus er på WordPress, frontend-performance og præcis browser-diagnostik. Intet overlades til tilfældighederne. Du er systematisk og dokumenterer alt med teknisk præcision.

**Overordnet Mål:** Udføre en udtømmende test af `rive-block` pluginet på branchen `feature/rive-debug-logging`. Planen skal validere samtlige specificerede features og caching-strategier for at sikre, at de fungerer fejlfrit og konsekvent på tværs af alle specificerede sider og scenarier.

---

#### **Fase 0: Status-Dashboard og Videnbase**

Denne fase indeholder det overordnede "Status-Dashboard" til at spore fremskridt og den samlede videnbase, der skal bruges som reference under hele testen.

**Status-Dashboard**

Disse tabeller fungerer som en overordnet tjekliste. De skal opdateres med "Fungerer" eller "Fejl" efter hvert relevant test-case fra Fase 3 er gennemført.

| Feature tjek                                                        | Status |
| :------------------------------------------------------------------ | :----- |
| Runs on rive render by the @rive-app/webgl2-advanced package        | ?      |
| Self hostet rive.wasm                                               | ?      |
| Preload wasm                                                        | ?      |
| Preload .riv animaion                                               | ?      |
| loadingPriority Heig = Preload                                      | ?      |
| loadingPriority low = Lasy load                                     | ?      |
| Viewport-based pause                                                | ?      |
| DPI aware canvas                                                    | ?      |
| ResizeObserver (responsive canvas sizing)                           | ?      |
| BFCache support (pageshow event handler)                            | ?      |
| Singleton runtime pattern (én WASM runtime delt af alle instances)  | ?      |
| Smart cache mode strategy (default → force-cache efter første load) | ?      |

| Caching teknologier                                           | Status |
| :------------------------------------------------------------ | :----- |
| HTTP Browser Caching (Server-Side - Nginx)                    | ?      |
| HTTP Caching via WordPress PHP (Server-Side) Backup Løsningen | ?      |
| In-Memory JavaScript Caching (Client-Side)                    | ?      |
| In-Memory Caching i Editor (Block Editor)                     | ?      |

---

**Videnbase (Autoritativt Bibliotek)**

Disse ressourcer skal konsulteres for at validere adfærd og forstå den underliggende teknologi, før generelle websøgninger overvejes.

*   **Primære Repositories:**
    *   `github.com/Hejsel/kaizenstudio-dev/tree/feature/rive-debug-logging` (Den specifikke kode, der testes)
    *   `github.com/rive-app/rive-wasm/blob/master/js/src/rive_advanced.mjs.d.ts#L75`
    *   `github.com/rive-app/rive-wasm/tree/master`
    *   `github.com/WordPress/gutenberg`

*   **Rive Dokumentation:**
    *   [Rive Generelt](https://rive.app/)
    *   [Best Practices](https://rive.app/docs/getting-started/best-practices)
    *   [Web JS Runtime](https://rive.app/docs/runtimes/web/web-js)
    *   [Low Level API Usage](https://rive.app/docs/runtimes/web/low-level-api-usage)
    *   [Preloading WASM](https://rive.app/docs/runtimes/web/preloading-wasm)
    *   [Preloading A Rive File](https://rive.app/docs/runtimes/caching-a-rive-file#web)
    *   [Caching A Rive File](https://codesandbox.io/p/sandbox/rive-js-caching-a-rive-file-g675my?file=%2Fsrc%2Findex.ts)

*   **Caching & Performance Dokumentation:**
    *   [BFCache](https://web.dev/articles/bfcache)
    *   [HTTP Cache (inkl. Memory & Disk Cache)](https://web.dev/articles/http-cache)
    *   [Navigation Preload](https://developer.chrome.com/docs/workbox/navigation-preload)

*   **WebGL2 Dokumentation:**
    *   [Khronos Group - WebGL](https://www.khronos.org/webgl/)

*   **WordPress Block Editor & Core Dokumentation:**
    *   [Gutenberg Storybook](https://wordpress.github.io/gutenberg/?path=/docs/docs-introduction--page)
    *   [Block Editor Developer Handbook](https://developer.wordpress.org/block-editor/)
    *   [Block API Reference](https://developer.wordpress.org/block-editor/reference-guides/block-api/)
    *   [Core Architecture Concepts](https://developer.wordpress.org/block-editor/explanations/architecture/key-concepts/)

---

#### **Fase 1: Forberedelse og Kontekst**

1.  **Kodebase Analyse:**
    *   **Server-Side Caching:** Analyser indholdet af `C:\Users\benja\Local Sites\kaizenstudio-dev\conf\nginx\includes`. Identificer alle Nginx-regler (`expires`, `add_header Cache-Control`, etc.) der gælder for filtyperne `.wasm` og `.riv`. Dokumenter den forventede caching-adfærd.
    *   **Plugin-Logik:** Analyser kildekoden i `C:\Users\benja\Local Sites\kaizenstudio-dev\app\public\wp-content\plugins\rive-block`. Fokuser på PHP-filer for server-side logik og JavaScript-filer for client-side logik. Brug debug-output fra branchen til at forstå interne processer.

2.  **Setup af Testmiljø:**
    *   Åbn Chrome i en inkognito-session.
    *   Åbn DevTools (`F12`).
    *   Log ind på WordPress: Gå til `http://kaizenstudio-dev.local/wp-admin/`. Brug `bh@kaizenstudio.dk` / `kaizenstudio100%`.
    *   Forbered tre faneblade:
        1.  **Editor:** `http://kaizenstudio-dev.local/wp-admin/site-editor.php?p=%2F&canvas=edit`
        2.  **Forside:** `http://kaizenstudio-dev.local/`
        3.  **Testside:** `http://kaizenstudio-dev.local/rive-test/`

---

#### **Fase 2: Definition af Standardiserede Testprocedurer (STP)**

**STP-1: Cache-Validering (Netværksanalyse)**
*   **Formål:** At verificere HTTP-caching og in-memory caching for et specifikt asset.
*   **Procedure:**
    1.  I DevTools, gå til "Network" fanen. Vælg "Disable cache".
    2.  **Første Load (Cache Priming):** Udfør en "Empty Cache and Hard Reload". *Verifikation:* Noter asset's `Status` (200), `Size` og response headers (`Cache-Control`, `ETag`).
    3.  Fjern hakket i "Disable cache".
    4.  **Normal Reload (Validation):** Udfør en normal reload (`F5`). *Verifikation:* Noter asset's `Status` (forventet: 304) og `Size` (lille).
    5.  **Navigation (Memory Cache):** Naviger til en anden side og tilbage. *Verifikation:* Noter asset's `Size` (forventet: `(memory cache)`).

**STP-2: BFCache-Validering**
*   **Formål:** At verificere at en side kan gendannes fra Back/Forward Cache.
*   **Procedure:**
    1.  Start på den side, der skal testes.
    2.  Naviger væk til en anden side.
    3.  Brug browserens "Tilbage"-knap.
    4.  I DevTools, gå til "Application" -> "Back-forward Cache" og kør testen.
*   **Succeskriterie:** Testen rapporterer "Successfully served from back-forward cache".

---

#### **Fase 3: Handlingsplan: Test-Suiter**

Dette er den detaljerede plan, der skal eksekveres. For hver test-case, udfør fremgangsmåden på **alle tre faneblade** (Editor, Forside, Testside), medmindre andet er angivet.

##### **Suite A: Feature-Tests**

| Test Case | Feature | Mål | Hypotese | Fremgangsmåde | Verifikationskriterier (Succes hvis...) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A.1** | `@rive-app/webgl2-advanced` | Verificere at den korrekte, avancerede Rive runtime anvendes. | Pluginnet indlæser `rive_advanced.mjs` eller en tilsvarende bundle, der muliggør WebGL2-rendering. | 1. Åbn DevTools "Sources" fane. 2. Søg efter `rive_advanced` i de indlæste scripts. 3. Kig efter konsol-logs fra debug-branchen, der bekræfter runtime-versionen. | Konsol-log bekræfter "Using WebGL2 Advanced Runtime" OG/ELLER filnavnet på det indlæste Rive-script indikerer "advanced". |
| **A.2** | Self-hosted `rive.wasm` | Sikre at WASM-filen serveres fra eget domæne, not Rive's CDN. | `rive.wasm` filen indlæses fra `http://kaizenstudio-dev.local/...` | 1. Åbn DevTools "Network" fane. 2. Filtrer på "wasm". 3. Observer anmodningens URL for `rive.wasm`. | Request URL for `rive.wasm` starter med `http://kaizenstudio-dev.local`. |
| **A.3** | Preload `wasm` & `.riv` | Validere at assets forudindlæses for at forbedre LCP. | `wasm` og `riv` filer med `loadingPriority="high"` får et `<link rel="preload">` i sidens `<head>`. | 1. Vælg "View Page Source" eller inspect `<head>` i "Elements" fanen. 2. Søg efter `<link rel="preload" ...>` for `.riv` og `.wasm`. 3. I Network-fanen, tjek "Priority"-kolonnen. | `<link rel="preload">` tags er til stede for de relevante filer. Netværksprioriteten er "Highest". |
| **A.4** | `loadingPriority="low"` | Validere at animationer med lav prioritet bliver lazy-loaded. | `.riv` filen for en animation "below the fold" indlæses ikke ved page load, men først når den scrolles ind i viewport. | 1. Find en Rive block med `loadingPriority="low"` længere nede på en side. 2. Åbn "Network" fanen. 3. Reload siden og bekræft at `.riv`-filen **ikke** indlæses. 4. Scroll ned. | `.riv`-filen indlæses **kun**, når blokken er tæt på/i viewport. Initiator for requesten er en JavaScript-fil. |
| **A.5** | Viewport-based pause | Bekræfte at animationer pauser, når de ikke er synlige. | CPU/GPU-brug falder markant, når Rive-animationen scrolles ud af viewport. | 1. Åbn DevTools "Performance monitor". 2. Scroll Rive-animationen ind og ud af viewport. 3. Observer CPU/GPU-brug. | CPU/GPU-brug falder til nær 0%, når animationen er ude af viewport, og stiger igen, når den kommer ind. |
| **A.6** | BFCache support | Sikre at sider med Rive-animationer er BFCache-kompatible. | Siden kan gendannes fra BFCache uden problemer. | Udfør **STP-2: BFCache-Validering**. | Testen passerer med "Successfully served from back-forward cache". |
| **A.7** | Singleton runtime pattern | Verificere at kun én WASM-runtime instans initialiseres og deles. | Debug-konsol-logs viser, at runtime initialiseres én gang og derefter genbruges. | 1. Placer flere Rive-blokke på samme side. 2. Åbn "Console"-fanen. 3. Udfør "Empty Cache and Hard Reload". 4. Filtrer på "Rive Runtime". | Der vises én log for "Initializing Rive WASM Runtime" og flere logs for "Reusing existing Rive instance". |
| **A.8** | Smart cache mode strategy | Validere at `force-cache` bruges efter første load af et asset. | En `.riv` fil hentes med `cache: "default"` første gang, og efterfølgende med `cache: "force-cache"`. | 1. Overvåg konsol-logs fra debug-branchen. 2. Udfør **STP-1: Cache-Validering**. 3. Sammenhold netværksadfærd med konsol-logs. | Konsol-log bekræfter skift fra "default" til "force-cache" for det samme asset på tværs af sideindlæsninger. |

##### **Suite B: Caching-Teknologi-Tests**

| Test Case | Caching Teknologi | Mål | Scenarier | Fremgangsmåde | Verifikationskriterier |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **B.1** | HTTP Caching (Nginx & PHP) | Verificere at server-konfigurerede `Cache-Control` og `Expires` headers anvendes korrekt. | 1. Reloads. 2. Link-navigation. 3. Tilbage/frem-navigation. 4. Direkte URL-navigation. | For hvert scenarie, udfør **STP-1: Cache-Validering** på `rive.wasm` og en `.riv` fil. | Resultaterne fra STP-1 matcher forventningerne (200 -> 304, `(memory cache)`). |
| **B.2** | In-Memory JS Caching | Verificere at Rive-assets hentes fra en JS-baseret memory cache, når det er muligt. | 1. Navigation mellem sider med samme Rive-animation. 2. Flere blokke på samme side med samme `.riv` fil. | 1. Åbn "Network"-fanen. 2. Naviger mellem Forside og Testside. 3. Observer netværksanmodninger for den delte `.riv`-fil. | Efter første load skal der **ikke** laves en ny netværksanmodning for den samme `.riv`-fil på en ny side. Konsol-logs bekræfter "Fetching animation from memory cache". |
| **B.3** | Caching i Editor | Sikre at caching-mekanismer også fungerer inde i Block Editor. | 1. Tilføje/fjerne Rive-blokke. 2. Ændre en bloks kilde. 3. Genindlæse editor. | Udfør **STP-1** på assets inde i **Editor** fanebladet. Se efter konsol-logs om genbrug af runtime. | Singleton-mønstret overholdes (se A.7). Netværksanmodninger minimeres ved brug af allerede indlæste animationer. |

---

#### **Fase 4: Rapportering og Fejldokumentation**

For **hver eneste afvigelse** fra verifikationskriterierne, opret en rapport med følgende struktur:

*   **Test Case ID:** (f.eks. `A.5`)
*   **Hvem:** (f.eks. "Anonym bruger")
*   **Hvad:** Præcis beskrivelse af fejlen (f.eks. "CPU-brug falder ikke, når Rive-blokken scrolles ud af viewport.")
*   **Hvorfor (Hypotese):** Teknisk årsag (f.eks. "IntersectionObserver'en bliver muligvis ikke initialiseret korrekt.")
*   **Hvornår:** (f.eks. "Under test af Viewport-based pause efter en normal reload.")
*   **Hvordan (Reproduktion):**
    1.  Start med tom cache i Chrome Inkognito.
    2.  Naviger til `http://kaizenstudio-dev.local/rive-test/`.
    3.  ... (Trin-for-trin guide)
    *   **Forventet Resultat:** CPU-brug for browser-processen falder til < 5%.
    *   **Faktisk Resultat:** CPU-brug forbliver på 40-50%.
    *   **Bevis:** Vedhæft screenshot af DevTools (f.eks. Performance Monitor) og relevante konsol-logs.
