import Footer from "@/components/homepage/footer/Footer"
import Header from "@/components/homepage/header/Header"
import Main from "@/components/homepage/main/Main"

export default function Home() {
  return (
    <div className = "flex flex-col gap-10">
      <Header />
      <Main />
      <Footer />
    </div>
  )
}
