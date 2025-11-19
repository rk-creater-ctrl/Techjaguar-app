import { getCourseBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Lock, PlayCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const course = await getCourseBySlug(params.slug);

  if (!course) {
    notFound();
  }

  return (
    <div className="mx-auto grid max-w-6xl flex-1 auto-rows-max gap-4">
      <div className="flex items-center gap-4">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
          {course.title}
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm">
            Share
          </Button>
          <Button size="sm">Start Learning</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  {course.imageUrl && (
                    <Image
                      src={course.imageUrl}
                      alt={course.title}
                      data-ai-hint={course.imageHint}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="grid gap-2">
                  <h2 className="text-2xl font-semibold font-headline">Description</h2>
                  <p className="text-muted-foreground">{course.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
               <h2 className="text-2xl font-semibold font-headline mb-4">Lectures</h2>
               <ul className="space-y-2">
                {course.lectures.map((lecture, index) => (
                  <li key={lecture.id} className="flex items-center justify-between rounded-lg border bg-card-foreground/5 p-4">
                    <div className="flex items-center gap-4">
                      {lecture.isFree || course.isFree ? (
                        <PlayCircle className="h-6 w-6 text-primary" />
                      ) : (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">{lecture.title}</span>
                        <span className="text-sm text-muted-foreground">{lecture.duration}</span>
                      </div>
                    </div>
                    {index < 2 && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </li>
                ))}
               </ul>
            </CardContent>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Progress value={course.progress} className="h-3" />
                <p className="text-sm text-muted-foreground">{course.progress}% of course completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                 <Avatar className="h-12 w-12">
                   <AvatarImage src={`https://i.pravatar.cc/150?u=${course.author}`} alt={course.author} />
                   <AvatarFallback>{course.author.charAt(0)}</AvatarFallback>
                 </Avatar>
                 <p className="font-medium">{course.author}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}