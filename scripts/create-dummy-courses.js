import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';
import { connectDb } from '../lib/mongodb.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Dummy course data
const dummyCourses = [
  {
    slug: 'japanese-basics-n5',
    title: 'Japanese Basics - JLPT N5 Complete Course',
    shortDescription: 'Master the fundamentals of Japanese language with this comprehensive N5 course covering hiragana, katakana, and basic grammar.',
    fullDescription: 'This comprehensive course is designed for absolute beginners who want to start their Japanese language journey. You will learn hiragana and katakana writing systems, basic vocabulary, essential grammar patterns, and practical conversation skills. By the end of this course, you will be able to read and write basic Japanese, introduce yourself, and have simple conversations about daily topics. Perfect preparation for JLPT N5 exam.',
    level: 'N5',
    price: 49,
    creditReward: 100,
    randomReward: true,
    tags: ['beginner', 'hiragana', 'katakana', 'basic-grammar', 'jlpt-n5'],
    highlights: [
      { description: 'Master Hiragana and Katakana writing systems' },
      { description: 'Learn 500+ essential Japanese vocabulary words' },
      { description: 'Understand basic grammar patterns and sentence structure' },
      { description: 'Practice real-world conversations and scenarios' },
      { description: 'Complete JLPT N5 preparation with mock exams' }
    ],
    thumbnail: '/placeholder.svg',
    previewVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    slug: 'intermediate-japanese-n4',
    title: 'Intermediate Japanese - JLPT N4 Mastery',
    shortDescription: 'Advance your Japanese skills with intermediate grammar, kanji, and conversation patterns for JLPT N4 level.',
    fullDescription: 'Take your Japanese to the next level with this intermediate course designed for JLPT N4 preparation. You will expand your vocabulary with 1,000+ new words, learn 300+ essential kanji characters, master intermediate grammar patterns, and develop more complex conversation skills. This course includes practical exercises, cultural insights, and comprehensive JLPT N4 preparation materials.',
    level: 'N4',
    price: 79,
    creditReward: 150,
    randomReward: true,
    tags: ['intermediate', 'kanji', 'grammar', 'jlpt-n4', 'conversation'],
    highlights: [
      { description: 'Learn 300+ essential Kanji characters' },
      { description: 'Master intermediate grammar patterns and conjugations' },
      { description: 'Expand vocabulary with 1,000+ new words' },
      { description: 'Develop complex conversation skills' },
      { description: 'Complete JLPT N4 preparation with practice tests' }
    ],
    thumbnail: '/placeholder.svg',
    previewVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    slug: 'advanced-japanese-n3',
    title: 'Advanced Japanese - JLPT N3 Fluency',
    shortDescription: 'Achieve fluency in Japanese with advanced grammar, complex kanji, and professional communication skills.',
    fullDescription: 'This advanced course is designed for serious Japanese learners aiming for JLPT N3 certification. You will master complex grammar structures, learn 600+ kanji characters, develop professional communication skills, and gain deep cultural understanding. Perfect for those planning to work or study in Japan, or simply wanting to achieve true fluency in Japanese.',
    level: 'N3',
    price: 129,
    creditReward: 200,
    randomReward: true,
    tags: ['advanced', 'fluency', 'kanji', 'jlpt-n3', 'professional'],
    highlights: [
      { description: 'Master 600+ Kanji characters and readings' },
      { description: 'Learn complex grammar and advanced sentence patterns' },
      { description: 'Develop professional and business communication skills' },
      { description: 'Understand Japanese culture and social nuances' },
      { description: 'Achieve JLPT N3 certification readiness' }
    ],
    thumbnail: '/placeholder.svg',
    previewVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    slug: 'japanese-conversation-practice',
    title: 'Japanese Conversation Practice - Real-World Scenarios',
    shortDescription: 'Improve your speaking skills with practical conversation practice covering daily life, travel, and business situations.',
    fullDescription: 'Focus on developing your speaking and listening skills with this conversation-focused course. Practice real-world scenarios including shopping, dining, travel, work situations, and social interactions. Learn natural expressions, cultural nuances, and how to sound more like a native speaker. Perfect for students who want to improve their practical communication skills.',
    level: 'N4',
    price: 59,
    creditReward: 120,
    randomReward: false,
    tags: ['conversation', 'speaking', 'listening', 'practical', 'real-world'],
    highlights: [
      { description: 'Practice 50+ real-world conversation scenarios' },
      { description: 'Learn natural expressions and cultural nuances' },
      { description: 'Improve pronunciation and listening comprehension' },
      { description: 'Master polite and casual speech patterns' },
      { description: 'Build confidence in Japanese communication' }
    ],
    thumbnail: '/placeholder.svg',
    previewVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    slug: 'kanji-mastery-course',
    title: 'Kanji Mastery - From Basics to Advanced',
    shortDescription: 'Master Japanese kanji characters with systematic learning approach, stroke order, and memory techniques.',
    fullDescription: 'This comprehensive kanji course takes you from basic characters to advanced readings and meanings. Learn stroke order, radicals, memory techniques, and practical applications. Covering 1,000+ kanji characters with systematic progression, this course is perfect for students who want to master Japanese writing and reading skills.',
    level: 'N3',
    price: 89,
    creditReward: 180,
    randomReward: true,
    tags: ['kanji', 'writing', 'reading', 'radicals', 'memory-techniques'],
    highlights: [
      { description: 'Learn 1,000+ Kanji characters systematically' },
      { description: 'Master stroke order and proper writing techniques' },
      { description: 'Understand radicals and character composition' },
      { description: 'Use memory techniques for efficient learning' },
      { description: 'Practice reading and writing in context' }
    ],
    thumbnail: '/placeholder.svg',
    previewVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    slug: 'japanese-business-etiquette',
    title: 'Japanese Business Etiquette & Professional Communication',
    shortDescription: 'Learn professional Japanese communication, business etiquette, and workplace culture for career success.',
    fullDescription: 'Master the art of professional Japanese communication with this specialized business course. Learn keigo (polite language), business etiquette, meeting protocols, email writing, and workplace culture. Essential for anyone working with Japanese companies or planning a career in Japan.',
    level: 'N2',
    price: 149,
    creditReward: 250,
    randomReward: false,
    tags: ['business', 'keigo', 'etiquette', 'professional', 'workplace'],
    highlights: [
      { description: 'Master Keigo (polite Japanese) for business' },
      { description: 'Learn Japanese business etiquette and protocols' },
      { description: 'Practice professional email and document writing' },
      { description: 'Understand workplace hierarchy and communication' },
      { description: 'Prepare for Japanese business environment' }
    ],
    thumbnail: '/placeholder.svg',
    previewVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
];

// Module data for each course
const getModulesForCourse = (courseLevel) => {
  const moduleTemplates = {
    N5: [
      { title: 'Introduction to Japanese', order: 1 },
      { title: 'Hiragana Mastery', order: 2 },
      { title: 'Katakana Mastery', order: 3 },
      { title: 'Basic Grammar Fundamentals', order: 4 },
      { title: 'Essential Vocabulary', order: 5 },
      { title: 'Simple Conversations', order: 6 }
    ],
    N4: [
      { title: 'Review and Foundation', order: 1 },
      { title: 'Essential Kanji Characters', order: 2 },
      { title: 'Intermediate Grammar', order: 3 },
      { title: 'Expanded Vocabulary', order: 4 },
      { title: 'Complex Conversations', order: 5 },
      { title: 'Cultural Context', order: 6 }
    ],
    N3: [
      { title: 'Advanced Grammar Structures', order: 1 },
      { title: 'Complex Kanji Mastery', order: 2 },
      { title: 'Professional Communication', order: 3 },
      { title: 'Reading Comprehension', order: 4 },
      { title: 'Writing Skills', order: 5 },
      { title: 'Cultural Fluency', order: 6 }
    ],
    N2: [
      { title: 'Business Japanese Fundamentals', order: 1 },
      { title: 'Keigo and Formal Language', order: 2 },
      { title: 'Professional Etiquette', order: 3 },
      { title: 'Business Writing', order: 4 },
      { title: 'Meeting and Presentation Skills', order: 5 },
      { title: 'Workplace Culture', order: 6 }
    ]
  };

  return moduleTemplates[courseLevel] || moduleTemplates.N5;
};

// Lesson data for each module
const getLessonsForModule = (moduleTitle, moduleOrder) => {
  const lessonTemplates = {
    'Introduction to Japanese': [
      { title: 'Welcome to Japanese Learning', order: 1, duration: 15 },
      { title: 'Japanese Writing Systems Overview', order: 2, duration: 20 },
      { title: 'Basic Pronunciation Guide', order: 3, duration: 18 },
      { title: 'Essential Greetings', order: 4, duration: 12 }
    ],
    'Hiragana Mastery': [
      { title: 'Hiragana Basics - Vowels and K-line', order: 1, duration: 25 },
      { title: 'S-line and T-line Characters', order: 2, duration: 22 },
      { title: 'N-line and H-line Characters', order: 3, duration: 20 },
      { title: 'M-line and Y-line Characters', order: 4, duration: 18 },
      { title: 'R-line and W-line Characters', order: 5, duration: 15 },
      { title: 'Hiragana Practice and Review', order: 6, duration: 30 }
    ],
    'Katakana Mastery': [
      { title: 'Katakana Basics - Vowels and K-line', order: 1, duration: 25 },
      { title: 'S-line and T-line Characters', order: 2, duration: 22 },
      { title: 'N-line and H-line Characters', order: 3, duration: 20 },
      { title: 'M-line and Y-line Characters', order: 4, duration: 18 },
      { title: 'R-line and W-line Characters', order: 5, duration: 15 },
      { title: 'Katakana Practice and Review', order: 6, duration: 30 }
    ],
    'Basic Grammar Fundamentals': [
      { title: 'Particles: は, が, を, に', order: 1, duration: 28 },
      { title: 'Present Tense Verbs', order: 2, duration: 25 },
      { title: 'Past Tense Verbs', order: 3, duration: 22 },
      { title: 'Adjectives and Descriptions', order: 4, duration: 20 },
      { title: 'Question Formation', order: 5, duration: 18 },
      { title: 'Grammar Practice Session', order: 6, duration: 35 }
    ],
    'Essential Vocabulary': [
      { title: 'Numbers and Counting', order: 1, duration: 20 },
      { title: 'Family and Relationships', order: 2, duration: 18 },
      { title: 'Colors and Descriptions', order: 3, duration: 15 },
      { title: 'Food and Dining', order: 4, duration: 22 },
      { title: 'Time and Dates', order: 5, duration: 25 },
      { title: 'Vocabulary Review and Practice', order: 6, duration: 30 }
    ],
    'Simple Conversations': [
      { title: 'Introducing Yourself', order: 1, duration: 20 },
      { title: 'Asking for Directions', order: 2, duration: 18 },
      { title: 'Shopping and Prices', order: 3, duration: 22 },
      { title: 'Ordering Food', order: 4, duration: 20 },
      { title: 'Making Plans', order: 5, duration: 25 },
      { title: 'Conversation Practice', order: 6, duration: 40 }
    ]
  };

  return lessonTemplates[moduleTitle] || [
    { title: `${moduleTitle} - Lesson 1`, order: 1, duration: 20 },
    { title: `${moduleTitle} - Lesson 2`, order: 2, duration: 18 },
    { title: `${moduleTitle} - Lesson 3`, order: 3, duration: 22 },
    { title: `${moduleTitle} - Lesson 4`, order: 4, duration: 25 }
  ];
};

// Quiz questions for modules
const getQuizQuestions = (moduleTitle) => {
  const quizTemplates = {
    'Hiragana Mastery': [
      {
        type: 'multiple_choice',
        question: 'What is the correct hiragana for "ka"?',
        points: 2,
        options: [
          { text: 'か', isCorrect: true },
          { text: 'き', isCorrect: false },
          { text: 'く', isCorrect: false },
          { text: 'け', isCorrect: false }
        ]
      },
      {
        type: 'multiple_choice',
        question: 'Which hiragana represents the sound "shi"?',
        points: 2,
        options: [
          { text: 'さ', isCorrect: false },
          { text: 'し', isCorrect: true },
          { text: 'す', isCorrect: false },
          { text: 'せ', isCorrect: false }
        ]
      },
      {
        type: 'fill_in_blanks',
        question: 'Write the hiragana for "ne": ___',
        points: 3,
        blanks: [
          { answer: 'ね', alternatives: ['ね'] }
        ]
      }
    ],
    'Basic Grammar Fundamentals': [
      {
        type: 'multiple_choice',
        question: 'Which particle is used to mark the subject of a sentence?',
        points: 2,
        options: [
          { text: 'は (wa)', isCorrect: false },
          { text: 'が (ga)', isCorrect: true },
          { text: 'を (wo)', isCorrect: false },
          { text: 'に (ni)', isCorrect: false }
        ]
      },
      {
        type: 'multiple_choice',
        question: 'How do you say "I eat" in Japanese?',
        points: 2,
        options: [
          { text: '食べます (tabemasu)', isCorrect: true },
          { text: '飲みます (nomimasu)', isCorrect: false },
          { text: '見ます (mimasu)', isCorrect: false },
          { text: '行きます (ikimasu)', isCorrect: false }
        ]
      },
      {
        type: 'fill_in_blanks',
        question: 'Complete: 私は___です (I am a student)',
        points: 3,
        blanks: [
          { answer: '学生', alternatives: ['学生', 'がくせい'] }
        ]
      }
    ],
    'Essential Vocabulary': [
      {
        type: 'multiple_choice',
        question: 'What is the Japanese word for "red"?',
        points: 2,
        options: [
          { text: '青 (ao)', isCorrect: false },
          { text: '赤 (aka)', isCorrect: true },
          { text: '緑 (midori)', isCorrect: false },
          { text: '白 (shiro)', isCorrect: false }
        ]
      },
      {
        type: 'matching',
        question: 'Match the Japanese numbers with their English equivalents:',
        points: 5,
        pairs: [
          { left: '一', right: '1', points: 1 },
          { left: '二', right: '2', points: 1 },
          { left: '三', right: '3', points: 1 },
          { left: '四', right: '4', points: 1 },
          { left: '五', right: '5', points: 1 }
        ]
      }
    ]
  };

  return quizTemplates[moduleTitle] || [
    {
      type: 'multiple_choice',
      question: `What did you learn in ${moduleTitle}?`,
      points: 2,
      options: [
        { text: 'Important concepts', isCorrect: true },
        { text: 'Nothing useful', isCorrect: false },
        { text: 'Only basic stuff', isCorrect: false },
        { text: 'Too difficult', isCorrect: false }
      ]
    }
  ];
};

async function createDummyCourses() {
  try {
    await connectDb();
    console.log('Connected to MongoDB');

    // Find or create an instructor user
    let instructor = await User.findOne({ role: 'instructor' });
    if (!instructor) {
      instructor = await User.create({
        name: 'Kensei Sensei',
        email: 'kensei@jotatsu.com',
        password: 'password123',
        role: 'instructor',
        provider: 'credentials'
      });
      console.log('Created instructor user:', instructor.name);
    }

    console.log('Creating dummy courses...');

    for (const courseData of dummyCourses) {
      // Check if course already exists
      const existingCourse = await Course.findOne({ slug: courseData.slug });
      if (existingCourse) {
        console.log(`Course "${courseData.title}" already exists, skipping...`);
        continue;
      }

      // Create course
      const course = await Course.create({
        ...courseData,
        instructor: instructor._id,
        isPublished: true,
        enrolledStudents: Math.floor(Math.random() * 50) + 10,
        ratingStats: {
          averageRating: Math.random() * 2 + 3, // 3-5 rating
          totalRatings: Math.floor(Math.random() * 30) + 5,
          distribution: {
            5: Math.floor(Math.random() * 20) + 5,
            4: Math.floor(Math.random() * 15) + 3,
            3: Math.floor(Math.random() * 10) + 2,
            2: Math.floor(Math.random() * 5) + 1,
            1: Math.floor(Math.random() * 3)
          }
        }
      });

      console.log(`Created course: ${course.title}`);

      // Create modules for the course
      const modules = getModulesForCourse(course.level);
      const createdModules = [];

      for (const moduleData of modules) {
        const module = await Module.create({
          courseRef: course._id,
          title: moduleData.title,
          order: moduleData.order,
          quiz: {
            title: `${moduleData.title} Quiz`,
            questions: getQuizQuestions(moduleData.title)
          }
        });

        createdModules.push(module);
        console.log(`  Created module: ${module.title}`);

        // Create lessons for the module
        const lessons = getLessonsForModule(moduleData.title, moduleData.order);
        const createdLessons = [];

        for (const lessonData of lessons) {
          const lesson = await Lesson.create({
            title: lessonData.title,
            order: lessonData.order,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Dummy video URL
            videoDuration: lessonData.duration * 60, // Convert minutes to seconds
            moduleRef: module._id,
            courseRef: course._id,
            resources: [
              {
                title: `${lessonData.title} - Study Notes`,
                fileUrl: '/placeholder.pdf'
              },
              {
                title: `${lessonData.title} - Practice Exercises`,
                fileUrl: '/placeholder.pdf'
              }
            ]
          });

          createdLessons.push(lesson);
          console.log(`    Created lesson: ${lesson.title}`);
        }

        // Update module with lessons
        module.lessons = createdLessons.map(lesson => lesson._id);
        await module.save();
      }

      // Update course with modules
      course.modules = createdModules.map(module => module._id);
      await course.save();

      console.log(`✅ Completed course: ${course.title} with ${createdModules.length} modules`);
    }

    console.log('\n🎉 All dummy courses created successfully!');
    console.log(`Created ${dummyCourses.length} courses with modules, lessons, and quizzes.`);

  } catch (error) {
    console.error('Error creating dummy courses:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the script
createDummyCourses();
