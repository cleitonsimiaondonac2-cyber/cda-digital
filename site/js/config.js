// Configuração do portal CDA — endereço do backend
// O site estático (GitHub Pages) e o backend (API self-hosted) podem viver em origens
// diferentes. Aponte API_BASE para o host onde corre o FastAPI.
//
// Páginas estáticas servidas pelo próprio backend: usar "" (mesma origem).
// Páginas estáticas no GitHub Pages com backend separado (ex. Railway/Render/VPS):
//   const CDA_API_BASE = "https://cda-api.seuhost.app";
//
var CDA_API_BASE = (function () {
  var local = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (local) return ""; // mesmo servidor local
  var cfg = window.CDA_API_OVERRIDE || "https://cda-backend.example.app";
  return cfg;
})();

// Base da API de IA (mesmo backend). Preferida pelo assistente quando presente.
var CDA_IA_API = (typeof CDA_API_BASE !== "undefined" && CDA_API_BASE) || "";
