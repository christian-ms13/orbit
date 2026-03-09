import { IconMenu2 } from "@tabler/icons-react"
import Image from "next/image"

export default function Header() {
  return (
    <header className = "flex items-center justify-between">
      <div className = "flex gap-3 items-center">
        <Image
          alt = "Logo"
          height = {30}
          priority
          src = "/logo/logo.png"
          width = {30}
        />

        <h1 
          className = "font-bold font-brand text-3xl text-white tracking-wider uppercase"
          style = {{ textShadow: "0 0 10px #00ffffcc, 0 0 20px #00ffff99, 0 0 30px #00ffff66, 0 0 40px #00ffff33" }}
        >
          orbit
        </h1>
      </div>

      <IconMenu2 className = "text-overlay-menu-toggle" stroke = {3} />
    </header>
  )
}
