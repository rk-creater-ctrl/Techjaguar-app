import Image from 'next/image';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import type { Course } from '@/lib/data';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CourseCardProps {
  course: Course & { imageUrl?: string; imageHint?: string };
}

export function CourseCard({ course }: CourseCardProps) {
  const CardWrapper = ({ children }: { children: React.ReactNode }) =>
    course.isFree ? (
      <Link href={`/courses/${course.slug}`}>{children}</Link>
    ) : (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{children}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upgrade to Pro to access this course</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

  return (
    <CardWrapper>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col group">
        <CardHeader className="p-0 relative">
          {!course.isFree && (
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="default" className="bg-primary hover:bg-primary">
                <Lock className="w-3 h-3 mr-1" />
                PRO
              </Badge>
            </div>
          )}
          {course.imageUrl && (
            <Image
              alt={course.title}
              className="aspect-video w-full object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={course.imageHint}
              height={400}
              src={course.imageUrl}
              width={600}
            />
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-headline leading-tight mb-2">
            {course.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{course.author}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          {course.progress > 0 && (
            <div className="w-full">
              <Progress value={course.progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {course.progress}% complete
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </CardWrapper>
  );
}
