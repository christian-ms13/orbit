export const dictionaries = {
  en: {
    "connection-graph.level-indicator.standby": "standby",
    "connection-graph.logo-alt": "Minimal Logo",
    "connection-graph.title": "connection graph",
    "connection.path-found-state.waiting": "waiting...",
    "connection.path-found": "path_found: ",

    "form.input.placeholder.starting": "e.g. Pedro Pascal",
    "form.input.placeholder.target": "e.g. Harrison Ford",
    "form.loading": "calculating...",
    "form.submit": "calculate path",

    "header.logo-alt": "Logo",

    "optimal-path-results.state.waiting": "waiting for user action",
    "optimal-path-results.title": "optimal path results",

    "overlay.english": "english",
    "overlay.figma": "check figma design",
    "overlay.github": "check github code",
    "overlay.spanish": "español"
  },
  es: {
    "connection-graph.level-indicator.standby": "en espera",
    "connection-graph.logo-alt": "Logo Minimalista",
    "connection-graph.title": "gráfico de conexión",
    "connection.path-found-state.waiting": "esperando...",
    "connection.path-found": "conexión_encontrada: ",

    "form.input.placeholder.starting": "ej. Pedro Pascal",
    "form.input.placeholder.target": "ej. Harrison Ford",
    "form.loading": "calculando...",
    "form.submit": "calcular conexión",

    "header.logo-alt": "Logo",

    "optimal-path-results.state.waiting": "esperando acción del usuario",
    "optimal-path-results.title": "conexión más óptima",

    "overlay.english": "english",
    "overlay.figma": "ver diseño en figma",
    "overlay.github": "ver código en github",
    "overlay.spanish": "español"
  }
}

export type TranslationKey = keyof typeof dictionaries.en
