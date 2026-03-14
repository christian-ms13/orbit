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
  poster_path: string | null
  title: string
}

interface TMDBCast {
  id: number
  name: string
  profile_path: string | null
}

async function fetchMoviesAndCast() {
  const session = driver.session()
  let totalMoviesAdded = 0

  try {
    console.log("🚀 starting database seed...")

    for (let page = 1; page <= 25; page++) {
      console.log("📦 fetching movies from tmdb (page " + page + ")...")

      const moviesRes = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`)
      const moviesData = await moviesRes.json()

      for (const movie of moviesData.results as TMDBMovie[]) {
        const creditsRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`)
        const creditsData = await creditsRes.json()

        const topCast: TMDBCast[] = creditsData.cast?.slice(0, 15) || []

        const movieData = {
          id: movie.id,
          poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
          title: movie.title
        }

        const castData = topCast.map(actor => ({
          id: actor.id,
          name: actor.name,
          profile: actor.profile_path ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` : null
        }))

        const query = `
          MERGE (m:Movie {id: $movieData.id})
          ON CREATE SET m.title = $movieData.title, m.poster = $movieData.poster_path

          WITH m
          UNWIND $castData AS actor

          MERGE (a:Actor {id: actor.id})
          ON CREATE SET a.name = actor.name, a.profile = actor.profile

          MERGE (a)-[:ACTED_IN]->(m)
        `

        await session.run(query, { movieData, castData })
        totalMoviesAdded++
        process.stdout.write(`\r✅ added movie: ${movie.title.substring(0, 30).padEnd(30)} (${totalMoviesAdded}/500)`)
      }
    }

    console.log("\n🎉 database seed complete!")
  } catch (e) {
    console.error("❌ error seeding database:", e)
  } finally {
    await session.close()
    await driver.close()
  }
}

fetchMoviesAndCast()
