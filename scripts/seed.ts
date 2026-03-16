import dotenv from "dotenv"
import neo4j from "neo4j-driver"

dotenv.config({ path: ".env.local" })

const PASSWORD = process.env.NEO4J_PASSWORD as string
const TMDB_API_KEY = process.env.TMDB_API_KEY as string
const URI = process.env.NEO4J_URI as string
const USER = process.env.NEO4J_USERNAME as string

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))

interface TMDBMovie {
  id: number
  title: string
}

interface TMDBCast {
  id: number
  name: string
}

async function fetchMoviesAndCast() {
  const session = driver.session()
  let totalMoviesAdded = 0

  try {
    console.log("🚀 starting massive database seed...")

    for (let page = 1; page <= 500; page++) {
      const moviesRes = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`)
      const moviesData = await moviesRes.json()

      for (const movie of moviesData.results as TMDBMovie[]) {
        const creditsRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`)
        const creditsData = await creditsRes.json()

        const topCast: TMDBCast[] = creditsData.cast?.slice(0, 30) || []

        const castData = topCast.map(actor => ({
          id: actor.id,
          name: actor.name
        }))

        const movieData = {
          id: movie.id,
          title: movie.title
        }

        const query = `
          MERGE (m:Movie {id: $movieData.id})
          ON CREATE SET m.title = $movieData.title

          WITH m
          UNWIND $castData AS actor

          MERGE (a:Actor {id: actor.id})
          ON CREATE SET a.name = actor.name

          MERGE (a)-[:ACTED_IN]->(m)
        `

        await session.run(query, { castData, movieData })
        totalMoviesAdded++
        process.stdout.write(`\r✅ added movie: ${movie.title.substring(0, 30).padEnd(30)} (${totalMoviesAdded}/10000)`)
      }
    }

    console.log("\n🎉 massive database seed complete!")
  } catch (e) {
    console.error("\n❌ error seeding database: ", e)
  } finally {
    await session.close()
    await driver.close()
  }
}

fetchMoviesAndCast()
