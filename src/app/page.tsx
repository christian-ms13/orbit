import Header from "@/components/header/Header"
import Main from "@/components/main/Main"

export default function Home() {
  return (
    <div className = "flex flex-col gap-10">
      <Header />
      <Main />
    </div>
  )
}
