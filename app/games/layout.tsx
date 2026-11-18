import { GameThemeProvider } from "@/components/game/theme"
import styles from "./games.module.css"

/** Every page under /games shares the player's chosen kitchen theme. */
export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root}>
      <GameThemeProvider>{children}</GameThemeProvider>
    </div>
  )
}
