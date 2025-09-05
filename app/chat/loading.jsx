import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChatLoading() {
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[80vh]">
          {/* Chat List Skeleton */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <div className="p-4 border-b">
                <Skeleton className="h-6 w-24 mb-3" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="flex-1 p-4 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Chat Area Skeleton */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              {/* Header Skeleton */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>

              {/* Messages Skeleton */}
              <div className="flex-1 p-4 space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`flex gap-3 ${i % 3 === 0 ? "flex-row-reverse" : ""}`}>
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className={`max-w-[70%] ${i % 3 === 0 ? "text-right" : ""}`}>
                      <Skeleton className={`h-10 ${i % 2 === 0 ? "w-48" : "w-32"} rounded-lg`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Skeleton */}
              <div className="p-4 border-t">
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
