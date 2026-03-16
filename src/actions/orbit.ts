"use server"

import { getDriver } from "@/lib/neo4j"

interface Neo4jNode {
  labels: string[]
  properties: Record<string, unknown>
}

export type PathNode = {
  [key: string]: unknown
  id?: string
  name?: string
  poster?: string
  profile?: string
  title?: string
  type: string
}

export type PathState = {
  message?: string
  path?: PathNode[]
  success: boolean
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
    const path: PathNode[] = rawNodes.map((node: Neo4jNode) => ({
      type: node.labels[0],
      ...node.properties
    })) as PathNode[]

    return { path, success: true }

  } catch (e) {
    console.error("❌ pathfinding error: ", e)
    return { message: "❌ failed to calculate path", success: false }
  } finally {
    await session.close()
  }
}
