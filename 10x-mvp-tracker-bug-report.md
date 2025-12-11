# Zgłoszenie błędu: @przeprogramowani/10x-mvp-tracker

**Tytuł:** Server does not support completions (required for completion/complete)

## Opis problemu

Pakiet `@przeprogramowani/10x-mvp-tracker` nie uruchamia się jako serwer MCP w Cursor IDE z powodu błędu związanego z próbą użycia capability "completions", która nie jest wspierana przez serwer MCP.

## Stack trace

```
Error: Server does not support completions (required for completion/complete)
    at Server.assertRequestHandlerCapability (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js:223:27)
    at Server.setRequestHandler (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js:877:14)
    at Server.setRequestHandler (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js:152:22)
    at FastMCPSession.setupCompleteHandlers (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/fastmcp/dist/FastMCP.js:664:18)
    at new FastMCPSession (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/fastmcp/dist/FastMCP.js:401:10)
    at FastMCP.start (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/fastmcp/dist/FastMCP.js:1402:23)
    at file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@przeprogramowani/10x-mvp-tracker/dist/index.js:42:5
    at ModuleJob.run (node:internal/modules/esm/module_job:377:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:671:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)
```

## Analiza problemu

Błąd występuje w `FastMCPSession.setupCompleteHandlers()` (linia 664 w `FastMCP.js`), która próbuje zarejestrować handler dla `completion/complete` bez wcześniejszego zadeklarowania capability "completions" w serwerze MCP.

Zgodnie z protokołem MCP, przed użyciem metody `setRequestHandler` dla `completion/complete`, serwer musi zadeklarować wsparcie dla capability "completions" podczas inicjalizacji.

## Konfiguracja MCP

```json
{
  "mcpServers": {
    "10x-mvp-tracker": {
      "command": "npx",
      "args": ["@przeprogramowani/10x-mvp-tracker"],
      "transport": "stdio"
    }
  }
}
```

## Środowisko

- **IDE**: Cursor IDE
- **Node.js**: v24.11.1
- **Pakiet**: @przeprogramowani/10x-mvp-tracker (pobrany przez npx)
- **System operacyjny**: Windows 10 (build 26200)
- **Transport**: stdio

## Weryfikacja problemu w Cursorze

Status serwera można sprawdzić w ustawieniach Cursora:
- Przejdź do **Settings** → **Tools & MCP**
- W sekcji **Installed MCP Servers** serwer `10x-mvp-tracker` wyświetla się z czerwoną kropką i komunikatem **"Error - Show Output"**
- Kliknięcie "Error - Show Output" pokazuje pełne logi błędu

## Kroki do odtworzenia

1. Dodaj konfigurację `10x-mvp-tracker` do `mcp.json` w Cursor
2. Zrestartuj Cursor IDE
3. Serwer próbuje się uruchomić, ale natychmiast kończy działanie z powyższym błędem
4. W ustawieniach **Tools & MCP** serwer wyświetla status błędu z czerwoną kropką

## Oczekiwane zachowanie

Serwer MCP powinien uruchomić się poprawnie i udostępnić narzędzia do śledzenia statusu projektu MVP.

## Proponowane rozwiązanie

1. **Opcja A**: Jeśli completions nie są potrzebne, wyłączyć `setupCompleteHandlers()` w kodzie pakietu lub skonfigurować FastMCP, aby nie używał completions.

2. **Opcja B**: Jeśli completions są wymagane, dodać deklarację capability "completions" podczas inicjalizacji serwera MCP:
   ```typescript
   server.setRequestHandler(ListCapabilitiesRequestSchema, async () => ({
     capabilities: {
       // ... inne capabilities
       completions: {} // Dodaj to
     }
   }));
   ```

3. **Opcja C**: Zaktualizować zależność `fastmcp` do wersji, która nie wymusza użycia completions lub pozwala na ich wyłączenie.

## Dodatkowe informacje

- Problem występuje zarówno przy pierwszym uruchomieniu, jak i przy ponownych próbach
- Inne serwery MCP (np. Context7) działają poprawnie w tej samej konfiguracji
- Pakiet jest pobierany przez `npx` z cache: `C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/`

## Pełne logi błędu

```
2025-12-11 21:55:55.911 [info] Handling CreateClient action
2025-12-11 21:55:55.911 [info] Starting new stdio process with command: npx @przeprogramowani/10x-mvp-tracker
2025-12-11 21:55:55.911 [info] Handling CreateClient action
2025-12-11 21:55:55.911 [info] Starting new stdio process with command: npx @przeprogramowani/10x-mvp-tracker
2025-12-11 21:55:56.396 [info] Handling ListOfferings action, server stored: false
2025-12-11 21:55:56.396 [error] No server info found
2025-12-11 21:55:56.566 [info] Handling CreateClient action
2025-12-11 21:55:56.566 [info] Starting new stdio process with command: npx @przeprogramowani/10x-mvp-tracker
2025-12-11 21:55:57.281 [error] file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js:223
                    throw new Error(`Server does not support completions (required for ${method})`);
                          ^

Error: Server does not support completions (required for completion/complete)
    at Server.assertRequestHandlerCapability (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js:223:27)
    at Server.setRequestHandler (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js:877:14)
    at Server.setRequestHandler (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js:152:22)
    at FastMCPSession.setupCompleteHandlers (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/fastmcp/dist/FastMCP.js:664:18)
    at new FastMCPSession (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/fastmcp/dist/FastMCP.js:401:10)
    at FastMCP.start (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/fastmcp/dist/FastMCP.js:1402:23)
    at file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@przeprogramowani/10x-mvp-tracker/dist/index.js:42:5
    at ModuleJob.run (node:internal/modules/esm/module_job:377:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:671:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v24.11.1

2025-12-11 21:55:57.299 [error] file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js:223
                    throw new Error(`Server does not support completions (required for ${method})`);
                          ^

Error: Server does not support completions (required for completion/complete)
    at Server.assertRequestHandlerCapability (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js:223:27)
    at Server.setRequestHandler (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js:877:14)
    at Server.setRequestHandler (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js:152:22)
    at FastMCPSession.setupCompleteHandlers (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/fastmcp/dist/FastMCP.js:664:18)
    at new FastMCPSession (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/fastmcp/dist/FastMCP.js:401:10)
    at FastMCP.start (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/fastmcp/dist/FastMCP.js:1402:23)
    at file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@przeprogramowani/10x-mvp-tracker/dist/index.js:42:5
    at ModuleJob.run (node:internal/modules/esm/module_job:377:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:671:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v24.11.1

2025-12-11 21:55:57.307 [info] Client closed for command
2025-12-11 21:55:57.328 [info] Client closed for command
2025-12-11 21:55:57.761 [info] Handling ListOfferings action, server stored: false
2025-12-11 21:55:57.761 [error] No server info found
2025-12-11 21:55:57.917 [error] file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js:223
                    throw new Error(`Server does not support completions (required for ${method})`);
                          ^

Error: Server does not support completions (required for completion/complete)
    at Server.assertRequestHandlerCapability (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js:223:27)
    at Server.setRequestHandler (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js:877:14)
    at Server.setRequestHandler (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js:152:22)
    at FastMCPSession.setupCompleteHandlers (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/fastmcp/dist/FastMCP.js:664:18)
    at new FastMCPSession (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/fastmcp/dist/FastMCP.js:401:10)
    at FastMCP.start (file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/fastmcp/dist/FastMCP.js:1402:23)
    at file:///C:/Users/karol/AppData/Local/npm-cache/_npx/2c7f42ce58220124/node_modules/@przeprogramowani/10x-mvp-tracker/dist/index.js:42:5
    at ModuleJob.run (node:internal/modules/esm/module_job:377:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:671:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v24.11.1

2025-12-11 21:55:57.942 [info] Client closed for command
2025-12-11 21:55:58.364 [info] Handling ListOfferings action, server stored: false
2025-12-11 21:55:58.364 [error] No server info found
```