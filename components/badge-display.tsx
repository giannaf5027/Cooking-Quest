const PH = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ccircle cx='50' cy='42' r='22' fill='%23d1d5db'/%3E%3Cpath d='M22 88c0-16 12-28 28-28s28 12 28 28' fill='%23d1d5db'/%3E%3C/svg%3E"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type Badge = {
  id: string
  name: string
  image: string
  description: string
  unlocked: boolean
}

type BadgeDisplayProps = {
  badges: Badge[]
  maxDisplay?: number
}

export function BadgeDisplay({ badges, maxDisplay = 5 }: BadgeDisplayProps) {
  // Sort badges so unlocked ones appear first
  const sortedBadges = [...badges].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1
    if (!a.unlocked && b.unlocked) return 1
    return 0
  })

  // Get displayed badges and remaining badges
  const displayBadges = sortedBadges.slice(0, maxDisplay)
  const remainingBadges = sortedBadges.slice(maxDisplay)
  const remainingCount = remainingBadges.length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <TooltipProvider>
          {displayBadges.map((badge) => (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <Card className={`w-12 h-12 p-0 ${!badge.unlocked ? "opacity-40 grayscale" : ""}`}>
                  <CardContent className="p-0 flex items-center justify-center h-full">
                    <img
                      src={PH}
                      alt={badge.name}
                      className="w-10 h-10 object-contain"
                    />
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                  {!badge.unlocked && (
                    <p className="text-xs mt-1 text-yellow-500 dark:text-yellow-400">Not yet unlocked</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}

          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="w-12 h-12 p-0 flex items-center justify-center cursor-pointer">
                  <CardContent className="p-0 flex items-center justify-center h-full">
                    <span className="text-sm font-medium">+{remainingCount}</span>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{remainingCount} more badges</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>

      {remainingCount > 0 && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">All Earned Badges</h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {remainingBadges
              .filter((badge) => badge.unlocked)
              .map((badge) => (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <Card className="w-10 h-10 p-0">
                      <CardContent className="p-0 flex items-center justify-center h-full">
                        <img
                          src={PH}
                          alt={badge.name}
                          className="w-8 h-8 object-contain"
                        />
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <p className="font-medium">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
