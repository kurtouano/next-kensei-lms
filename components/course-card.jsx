import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export function CourseCard({ title, description, image, category, lessons }) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md border-[#d4c9bd]">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-[#ece6dd] text-[#8b5d33] hover:bg-[#d4c9bd] border-[#d4c9bd]">
            {category}
          </Badge>
          <div className="flex items-center text-sm text-[#5a5a5a]">
            <BookOpen className="mr-1 h-4 w-4" />
            {lessons} lessons
          </div>
        </div>
        <h3 className="text-xl font-semibold text-[#2c2c2c] mt-2">{title}</h3>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-[#5a5a5a]">{description}</p>
      </CardContent>
      <CardFooter className="p-4 border-t border-[#d4c9bd] bg-[#f8f5f2]">
        <button className="text-sm font-medium text-[#8b5d33] hover:text-[#6a472a] transition-colors">
          View Course Details →
        </button>
      </CardFooter>
    </Card>
  )
}
