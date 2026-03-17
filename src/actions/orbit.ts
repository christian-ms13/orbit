"use server"

import { ManagedTransaction, Session } from "neo4j-driver"
import { getDriver } from "@/lib/neo4j"

interface Neo4jNode {
  labels: string[]
  properties: Record<string, unknown>
}

export type PathNode = {
  [key: string]: unknown
  genres?: string[]
  id?: number
  language?: string
  name?: string
  poster?: string
  profile?: string
  release_date?: string
  runtime?: number
  title?: string
  type: string
  vote_average?: number
}

export type PathState = {
  message?: "optimal-path-results.error.calculation-failed" | "optimal-path-results.error.missing-names" | "optimal-path-results.error.no-connection"
  path?: PathNode[]
  success: boolean
}

async function expandActorNetwork(actorName: string, session: Session): Promise<boolean> {
  const apiKey = process.env.TMDB_API_KEY

  try {
    const searchRes = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(actorName)}`)
    const searchData = await searchRes.json()

    if (!searchData.results?.length) {
      return false
    }

    const actor = searchData.results[0]

    const creditsRes = await fetch(`https://api.themoviedb.org/3/person/${actor.id}/movie_credits?api_key=${apiKey}`)
    const creditsData = await creditsRes.json()

    const movies = (creditsData.cast || []).slice(0, 150).map((m: { id: number; title: string }) => ({
      id: m.id,
      title: m.title
    }))

    if (movies.length === 0) {
      return false
    }

    const query = `
      MERGE (a:Actor {id: $actorId})
      ON CREATE SET a.name = $actorName

      WITH a
      UNWIND $movies AS movie

      MERGE (m:Movie {id: movie.id})
      ON CREATE SET m.title = movie.title

      MERGE (a)-[:ACTED_IN]->(m)
    `

    await session.executeWrite((tx: ManagedTransaction) =>
      tx.run(query, { actorId: actor.id, actorName: actor.name, movies })
    )

    return true
  } catch (e) {
    console.error("❌ error expanding actor network: ", e)
    return false
  }
}

async function fetchTMDBDetails(id: number | string, type: string): Promise<Partial<PathNode>> {
  const apiKey = process.env.TMDB_API_KEY

  try {
    if (type === "Movie") {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`)
      const data = await res.json()

      return {
        genres: data.genres?.map((g: { name: string }) => g.name) || [],
        language: data.spoken_languages?.[0]?.english_name || data.original_language,
        poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : undefined,
        release_date: data.release_date,
        runtime: data.runtime,
        title: data.title,
        vote_average: data.vote_average
      }
    }

    const res = await fetch(`https://api.themoviedb.org/3/person/${id}?api_key=${apiKey}`)
    const data = await res.json()

    return {
      name: data.name,
      profile: data.profile_path ? `https://image.tmdb.org/t/p/w500${data.profile_path}` : undefined
    }
  } catch (e) {
    console.error("❌ error fetching TMDB details: ", e)
    return {}
  }
}

export async function findShortestPath(prevState: PathState, formData: FormData): Promise<PathState> {
  const actor1Name = formData.get("actor1") as string
  const actor2Name = formData.get("actor2") as string

  if (!actor1Name || !actor2Name) {
    return { message: "optimal-path-results.error.missing-names", success: false }
  }

  const driver = getDriver()
  const session = driver.session()

  try {
    const searchName1 = actor1Name.toLowerCase()
    const searchName2 = actor2Name.toLowerCase()

    const pathQuery = `
      MATCH (start:Actor) WHERE toLower(start.name) = $searchName1
      MATCH (end:Actor) WHERE toLower(end.name) = $searchName2
      MATCH p = allShortestPaths((start)-[:ACTED_IN*1..6]-(end))
      RETURN nodes(p) AS pathNodes
    `

    let result = await session.executeRead((tx: ManagedTransaction) =>
      tx.run(pathQuery, { searchName1, searchName2 })
    )

    if (result.records.length === 0) {
      const expanded1 = await expandActorNetwork(actor1Name, session)
      const expanded2 = await expandActorNetwork(actor2Name, session)

      if (expanded1 || expanded2) {
        result = await session.executeRead((tx: ManagedTransaction) =>
          tx.run(pathQuery, { searchName1, searchName2 })
        )
      }
    }

    if (result.records.length === 0) {
      return { message: "optimal-path-results.error.no-connection", success: false }
    }

    const allPaths = result.records
    const randomIndex = Math.floor(Math.random() * allPaths.length)
    const selectedRecord = allPaths[randomIndex]

    const rawNodes = selectedRecord.get("pathNodes")

    const basicPath = rawNodes.map((node: Neo4jNode) => ({
      id: node.properties.id as number,
      name: node.properties.name as string | undefined,
      title: node.properties.title as string | undefined,
      type: node.labels[0]
    }))

    const hydratedPath = await Promise.all(
      basicPath.map(async (node: { id: number; name?: string; title?: string; type: string }) => {
        const tmdbDetails = await fetchTMDBDetails(node.id, node.type)

        return {
          ...node,
          ...tmdbDetails
        }
      })
    )

    return { path: hydratedPath as PathNode[], success: true }
  } catch (e) {
    console.error("❌ error finding shortest path: ", e)
    return { message: "optimal-path-results.error.calculation-failed", success: false }
  } finally {
    await session.close()
  }
}
