import { PlaceHolderImages } from './placeholder-images';
import type { Course, Subscription } from './data';

const courses: Omit<Course, 'imageUrl' | 'imageHint'>[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    slug: 'intro-to-web-dev',
    description:
      'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.',
    author: 'Dr. Evelyn Reed',
    isFree: true,
    progress: 75,
    imageId: 'web-dev-intro',
    instructorId: 'placeholder',
    categoryId: 'web-dev',
    price: 0,
    lectures: [
      {
        id: '1-1',
        title: 'The Basics of HTML',
        duration: '15:20',
        isFree: true,
        courseId: '1',
        description: '',
        videoUrl: '',
      },
      {
        id: '1-2',
        title: 'Styling with CSS',
        duration: '25:45',
        isFree: true,
        courseId: '1',
        description: '',
        videoUrl: '',
      },
      {
        id: '1-3',
        title: 'Introduction to JavaScript',
        duration: '35:10',
        isFree: true,
        courseId: '1',
        description: '',
        videoUrl: '',
      },
      {
        id: '1-4',
        title: 'Building Your First Website',
        duration: '45:00',
        isFree: true,
        courseId: '1',
        description: '',
        videoUrl: '',
      },
    ],
  },
];

const subscriptions: Subscription[] = [
  {
    id: 'sub_1',
    userId: 'defaultUser', // This will be the mock user ID.
    startDate: '2023-01-15T00:00:00Z',
    endDate: '2024-01-15T00:00:00Z',
    status: 'active',
  },
];

export const getSubscriptionByUserId = async (
  userId: string
): Promise<Subscription | undefined> => {
  // In a real app, you would fetch this from Firestore.
  // For now, we'll simulate it with a mock user.
  await new Promise((resolve) => setTimeout(resolve, 300));
  const userSub = subscriptions.find(
    (s) => s.userId === 'defaultUser' || s.userId === userId
  );
  return userSub;
};
