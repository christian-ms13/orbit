import ConnectionGraph from "./ConnectionGraph"
import Form from "./Form"

export default function Main() {
  return (
    <main className = "flex flex-col gap-10">
      <Form />
      <ConnectionGraph />
    </main>
  )
}
