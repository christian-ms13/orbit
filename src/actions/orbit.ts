"use server"

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
  message?: string
  path?: PathNode[]
  success: boolean
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
    console.error(`❌ failed to fetch tmdb details for ${type} ${id}: `, e)
    return {}
  }
}

export async function findShortestPath(prevState: PathState, formData: FormData): Promise<PathState> {
  const actor1Name = formData.get("actor1") as string
  const actor2Name = formData.get("actor2") as string

  if (!actor1Name || !actor2Name) {
    return { message: "❌ both actor names are required", success: false }
  }

  const driver = getDriver()
  const session = driver.session()

  try {
    const searchName1 = actor1Name.toLowerCase()
    const searchName2 = actor2Name.toLowerCase()

    const query = `
      MATCH (start:Actor) WHERE toLower(start.name) = $searchName1
      MATCH (end:Actor) WHERE toLower(end.name) = $searchName2
      MATCH p = allShortestPaths((start)-[:ACTED_IN*1..6]-(end))
      RETURN nodes(p) AS pathNodes
    `

    const result = await session.executeRead((tx) =>
      tx.run(query, { searchName1, searchName2 })
    )

    if (result.records.length === 0) {
      return { message: "❌ no connection found between these actors", success: false }
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
    console.error("❌ pathfinding error: ", e)
    return { message: "❌ failed to calculate path", success: false }
  } finally {
    await session.close()
  }
}
