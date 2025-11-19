import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreateCourseForm } from './create-course-form';

export default function CreateCoursePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Create a New Course</CardTitle>
            <CardDescription>
              Fill out the details below to create a new course.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateCourseForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
