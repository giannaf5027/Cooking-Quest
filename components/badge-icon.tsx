// crops one badge out of a 4x2 sprite sheet (KAN-6)
// sheet cells are 362x543 (not square), so height is derived from width to avoid stretching

import type { Badge } from "@/lib/badges"

const CELL_W = 362
const CELL_H = 543

export function BadgeIcon({ badge, width = 48, className }: { badge: Badge; width?: number; className?: string }) {
    const height = width * (CELL_H / CELL_W)
    return (
        <div
            role="img"
            aria-label={badge.name}
            className={className}
            style={{
                width,
                height,
                backgroundImage: `url(${badge.sheet.src})`,
                backgroundSize: `${width * 4}px ${height * 2}px`,
                backgroundPosition: `-${badge.col * width}px -${badge.row * height}px`,
                backgroundRepeat: "no-repeat",
            }}
        />
    )
}
