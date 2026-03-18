import { normalizeActorNameForMatch, sanitizeActorNameInput } from "@/lib/actorName"
import { getDriver } from "@/lib/neo4j"
import { ManagedTransaction } from "neo4j-driver"

type SuggestionSource = "neo4j" | "tmdb"

type ActorSuggestion = {
  name: string
  source: SuggestionSource
}

type RankedSuggestion = ActorSuggestion & {
  score: number
}

type TMDBPerson = {
  known_for_department?: string
  name?: string
  popularity?: number
}

type Neo4jSuggestionRecord = {
  get: (key: string) => unknown
}

const NEO4J_CANDIDATE_LIMIT = 80
const TMDB_MAX_RESULTS = 60
const TMDB_PAGES_TO_SCAN = 2

function hasEnv(name: string): boolean {
  const value = process.env[name]
  return typeof value === "string" && value.trim().length > 0
}

function tokenize(value: string): string[] {
  return value.split(" ").filter((token) => token.length > 0)
}

function scoreCandidate(query: string, name: string, source: SuggestionSource, popularity = 0, knownForDepartment = ""): number {
  const normalizedQuery = normalizeActorNameForMatch(query)
  const normalizedName = normalizeActorNameForMatch(name)

  if (!normalizedQuery || !normalizedName) {
    return -1
  }

  const queryTokens = tokenize(normalizedQuery)
  const nameTokens = tokenize(normalizedName)

  let score = 0

  if (normalizedName === normalizedQuery) {
    score += 1200
  }

  if (normalizedName.startsWith(normalizedQuery)) {
    score += 900
  }

  if (normalizedName.includes(` ${normalizedQuery}`)) {
    score += 750
  }

  if (normalizedName.includes(normalizedQuery)) {
    score += 350
  }

  for (const token of nameTokens) {
    if (token === normalizedQuery) {
      score += 300
      continue
    }

    if (token.startsWith(normalizedQuery)) {
      score += 220
    }
  }

  for (const token of queryTokens) {
    if (nameTokens.some((candidateToken) => candidateToken.startsWith(token))) {
      score += 60
    }
  }

  if (source === "tmdb") {
    score += Math.min(popularity, 120)
    if (knownForDepartment === "Acting") {
      score += 90
    }
  }

  if (source === "neo4j") {
    score += 30
  }

  score += Math.max(0, 45 - normalizedName.length)

  return score
}

function rankAndDedupeSuggestions(items: RankedSuggestion[], limit: number): ActorSuggestion[] {
  const bestByKey = new Map<string, RankedSuggestion>()

  for (const item of items) {
    const key = normalizeActorNameForMatch(item.name)

    if (!key || item.score < 0) {
      continue
    }

    const existing = bestByKey.get(key)

    if (!existing || item.score > existing.score) {
      bestByKey.set(key, item)
    }
  }

  return Array.from(bestByKey.values())
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }

      return a.name.localeCompare(b.name)
    })
    .slice(0, limit)
    .map(({ name, source }) => ({ name, source }))
}

async function searchNeo4jActors(query: string): Promise<RankedSuggestion[]> {
  const normalizedQuery = normalizeActorNameForMatch(query)

  if (!normalizedQuery || !hasEnv("NEO4J_URI") || !hasEnv("NEO4J_USERNAME") || !hasEnv("NEO4J_PASSWORD")) {
    return []
  }

  const fallbackNormalize = "toLower(trim(replace(replace(replace(a.name, '    ', ' '), '   ', ' '), '  ', ' ')))"

  const cypher = `
    MATCH (a:Actor)
    WITH a, coalesce(a.normalizedName, ${fallbackNormalize}) AS normalized
    WHERE normalized CONTAINS $normalizedQuery
    RETURN DISTINCT a.name AS name, normalized
    ORDER BY CASE WHEN normalized STARTS WITH $normalizedQuery THEN 0 ELSE 1 END, size(normalized), a.name
    LIMIT $candidateLimit
  `

  const session = getDriver().session()

  try {
    const result = await session.executeRead((tx: ManagedTransaction) =>
      tx.run(cypher, { candidateLimit: NEO4J_CANDIDATE_LIMIT, normalizedQuery })
    )

    return result.records
      .map((record: Neo4jSuggestionRecord) => ({
        name: String(record.get("name") ?? ""),
        source: "neo4j" as const,
        score: scoreCandidate(query, String(record.get("name") ?? ""), "neo4j")
      }))
      .filter((record) => record.name.length > 0)
  } catch (error) {
    console.error("❌ error searching Neo4j actor suggestions: ", error)
    return []
  } finally {
    await session.close()
  }
}

async function searchTMDBActors(query: string): Promise<RankedSuggestion[]> {
  if (!hasEnv("TMDB_API_KEY")) {
    return []
  }

  try {
    const apiKey = process.env.TMDB_API_KEY
    const allResults: TMDBPerson[] = []

    for (let page = 1; page <= TMDB_PAGES_TO_SCAN; page++) {
      const endpoint = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false&page=${page}`
      const response = await fetch(endpoint, { cache: "no-store" })

      if (!response.ok) {
        break
      }

      const data = await response.json()

      if (!Array.isArray(data.results) || data.results.length === 0) {
        break
      }

      allResults.push(...(data.results as TMDBPerson[]))

      if (allResults.length >= TMDB_MAX_RESULTS) {
        break
      }
    }

    return allResults
      .slice(0, TMDB_MAX_RESULTS)
      .map((result) => {
        const name = String(result.name ?? "")

        return {
          name,
          source: "tmdb" as const,
          score: scoreCandidate(query, name, "tmdb", Number(result.popularity ?? 0), String(result.known_for_department ?? ""))
        }
      })
      .filter((result) => result.name.length > 0)
  } catch (error) {
    console.error("❌ error searching TMDB actor suggestions: ", error)
    return []
  }
}

export async function getActorSuggestions(rawQuery: string, limit = 12): Promise<ActorSuggestion[]> {
  const query = sanitizeActorNameInput(rawQuery)

  if (query.length < 1) {
    return []
  }

  const clampedLimit = Math.max(1, Math.min(limit, 20))

  const [neo4jSuggestions, tmdbSuggestions] = await Promise.all([
    searchNeo4jActors(query),
    searchTMDBActors(query)
  ])

  return rankAndDedupeSuggestions([...neo4jSuggestions, ...tmdbSuggestions], clampedLimit)
}
