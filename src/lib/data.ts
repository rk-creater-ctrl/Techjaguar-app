import { PlaceHolderImages } from './placeholder-images';

export interface Lecture {
  id: string;
  title: string;
  duration: string; // e.g., "12:34"
  isFree: boolean;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  author: string;
  isFree: boolean;
  progress: number; // 0-100
  imageId: string;
  lectures: Lecture[];
  imageUrl?: string;
  imageHint?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'cancelled';
}


const courses: Omit<Course, 'imageUrl' | 'imageHint'>[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    slug: 'intro-to-web-dev',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.',
    author: 'Dr. Evelyn Reed',
    isFree: true,
    progress: 75,
    imageId: 'web-dev-intro',
    lectures: [
      { id: '1-1', title: 'The Basics of HTML', duration: '15:20', isFree: true },
      { id: '1-2', title: 'Styling with CSS', duration: '25:45', isFree: true },
      { id: '1-3', title: 'Introduction to JavaScript', duration: '35:10', isFree: true },
      { id: '1-4', title: 'Building Your First Website', duration: '45:00', isFree: true },
    ],
  },
  {
    id: '2',
    title: 'Advanced JavaScript Concepts',
    slug: 'advanced-javascript',
    description: 'Dive deep into closures, prototypes, async/await, and modern ES modules.',
    author: 'Prof. Kenji Tanaka',
    isFree: false,
    progress: 20,
    imageId: 'js-advanced',
    lectures: [
      { id: '2-1', title: 'Understanding the Event Loop', duration: '22:30', isFree: true },
      { id: '2-2', title: 'Mastering Promises', duration: '30:15', isFree: false },
      { id: '2-3', title: 'Async/Await in Practice', duration: '28:50', isFree: false },
      { id: '2-4', title: 'Modules and Bundlers', duration: '40:05', isFree: false },
    ],
  },
  {
    id: '3',
    title: 'React for Beginners',
    slug: 'react-for-beginners',
    description: 'Build dynamic user interfaces with React, the popular JavaScript library.',
    author: 'Dr. Evelyn Reed',
    isFree: true,
    progress: 0,
    imageId: 'react-hooks',
    lectures: [
        { id: '3-1', title: 'What is React?', duration: '10:00', isFree: true },
        { id: '3-2', title: 'Components and Props', duration: '18:30', isFree: true },
        { id: '3-3', title: 'State and Lifecycle', duration: '22:00', isFree: true },
        { id: '3-4', title: 'Handling Events', duration: '15:45', isFree: true },
    ],
  },
  {
    id: '4',
    title: 'Data Science 101',
    slug: 'data-science-101',
    description: 'An introduction to data analysis and machine learning with Python.',
    author: 'Dr. Anya Sharma',
    isFree: false,
    progress: 0,
    imageId: 'data-science-101',
    lectures: [
        { id: '4-1', title: 'Introduction to Data Science', duration: '12:00', isFree: true },
        { id: '4-2', title: 'Python for Data Analysis with Pandas', duration: '45:30', isFree: false },
        { id: '4-3', title: 'Data Visualization with Matplotlib', duration: '35:15', isFree: false },
        { id: '4-4', title: 'Machine Learning Fundamentals', duration: '55:00', isFree: false },
    ],
  },
  {
    id: '5',
    title: 'Python Mastery',
    slug: 'python-mastery',
    description: 'From fundamentals to advanced topics, become a Python expert.',
    author: 'Prof. Kenji Tanaka',
    isFree: false,
    progress: 50,
    imageId: 'python-mastery',
    lectures: [
        { id: '5-1', title: 'Python Basics Refresher', duration: '20:00', isFree: true },
        { id: '5-2', title: 'Object-Oriented Programming', duration: '40:30', isFree: false },
        { id: '5-3', title: 'Decorators and Generators', duration: '33:20', isFree: false },
        { id: '5-4', title: 'Concurrency in Python', duration: '48:10', isFree: false },
    ],
  },
  {
    id: '6',
    title: 'UX Design Fundamentals',
    slug: 'ux-design-fundamentals',
    description: 'Learn the principles of user-centered design and create intuitive products.',
    author: 'Maria Rodriguez',
    isFree: true,
    progress: 100,
    imageId: 'ux-design-fundamentals',
    lectures: [
        { id: '6-1', title: 'What is UX Design?', duration: '14:00', isFree: true },
        { id: '6-2', title: 'User Research and Personas', duration: '24:30', isFree: true },
        { id: '6-3', title: 'Wireframing and Prototyping', duration: '29:00', isFree: true },
    ],
  },
];

// Add image URLs to courses
const coursesWithImages: Course[] = courses.map(course => {
  const image = PlaceHolderImages.find(img => img.id === course.imageId);
  return {
    ...course,
    imageUrl: image?.imageUrl,
    imageHint: image?.imageHint,
  };
});

const subscriptions: Subscription[] = [
    {
        id: 'sub_1',
        userId: 'defaultUser', // This will be the mock user ID.
        startDate: '2023-01-15T00:00:00Z',
        endDate: '2024-01-15T00:00:00Z',
        status: 'active',
    }
]

export const getCourses = async (): Promise<Course[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return coursesWithImages;
};

export const getCourseBySlug = async (slug: string): Promise<Course | undefined> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return coursesWithImages.find(course => course.slug === slug);
};

export const getSubscriptionByUserId = async (userId: string): Promise<Subscription | undefined> => {
    // In a real app, you would fetch this from Firestore.
    // For now, we'll simulate it with a mock user.
    await new Promise(resolve => setTimeout(resolve, 300));
    const userSub = subscriptions.find(s => s.userId === 'defaultUser' || s.userId === userId);
    return userSub;
}
