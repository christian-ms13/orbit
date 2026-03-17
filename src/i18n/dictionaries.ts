export const dictionaries = {
  en: {
    "connection-graph.level-indicator.standby": "standby",
    "connection-graph.logo-alt": "Minimal Logo",
    "connection-graph.title": "connection graph",
    "connection.path-found-state.waiting": "waiting...",
    "connection.path-found": "path_found: ",

    "form.input.placeholder.starting": "e.g. Michael B. Jordan",
    "form.input.placeholder.target": "e.g. Ryan Gosling",
    "form.loading": "calculating...",
    "form.submit": "calculate path",

    "header.logo-alt": "Logo",

    "optimal-path-results.error.calculation-failed": "failed to calculate path",
    "optimal-path-results.error.missing-names": "both actor names are required",
    "optimal-path-results.error.no-connection": "no connection found between these actors",
    "optimal-path-results.node.actor": "actor",
    "optimal-path-results.node.movie": "movie",
    "optimal-path-results.results.connection": "connection",
    "optimal-path-results.results.origin-actor": "origin actor",
    "optimal-path-results.results.target-actor": "target actor",
    "optimal-path-results.state.calculating": "calculating path...",
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

    "form.input.placeholder.starting": "ej. Michael B. Jordan",
    "form.input.placeholder.target": "ej. Ryan Gosling",
    "form.loading": "calculando...",
    "form.submit": "calcular conexión",

    "header.logo-alt": "Logo",

    "optimal-path-results.error.calculation-failed": "falló el cálculo de la conexión",
    "optimal-path-results.error.missing-names": "se requieren ambos nombres de actores",
    "optimal-path-results.error.no-connection": "no se encontró conexión entre estos actores",
    "optimal-path-results.node.actor": "actor",
    "optimal-path-results.node.movie": "película",
    "optimal-path-results.results.connection": "conexión",
    "optimal-path-results.results.origin-actor": "actor origen",
    "optimal-path-results.results.target-actor": "actor destino",
    "optimal-path-results.state.calculating": "calculando conexión...",
    "optimal-path-results.state.waiting": "esperando acción del usuario",
    "optimal-path-results.title": "conexión más óptima",

    "overlay.english": "english",
    "overlay.figma": "ver diseño en figma",
    "overlay.github": "ver código en github",
    "overlay.spanish": "español"
  }
}

export type TranslationKey = keyof typeof dictionaries.en
