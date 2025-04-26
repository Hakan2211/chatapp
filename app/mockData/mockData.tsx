// routes/dashboard/mockData.ts

import React from 'react';
import { HomeIcon, FileTextIcon } from 'lucide-react'; // Import React if using ReactNode in types

export enum PanelType {
  Account = 'account',
  Home = 'home',
  Projects = 'projects',
  Notes = 'notes',
  Education = 'education',
}

// --- User Data ---
export interface UserData {
  name: string;
  email: string;
  avatar: string;
}

export const mockUserData: UserData = {
  name: 'Learn User',
  email: 'user@learnsphere.ai',
  avatar: '/placeholder.svg', // Use placeholder or a real path
};

// --- Project Files Data ---
export interface ProjectTreeOptions {
  starred?: boolean;
  // Add other potential metadata here
}

export type ProjectFileTreeItem =
  | string // Represents a file name
  | [string, ...ProjectFileTreeItem[]] // Folder [folderName, item1, item2, ...]
  | [string, ...ProjectFileTreeItem[], ProjectTreeOptions]; // Folder with options

export interface MockProjectFilesData {
  tree: ProjectFileTreeItem[];
}

export const mockProjectFiles: MockProjectFilesData = {
  tree: [
    [
      'AI Projects', // Folder Name
      [
        'Neural Network', // Sub-folder
        ['src', 'train.py', 'model.py', 'utils.py'], // Sub-sub-folder with files
        'README.md',
        ['data', ['images', 'cat.jpg', 'dog.jpg'], 'labels.csv'],
      ],
      { starred: true }, // Options for "AI Projects"
    ],
    [
      'Web Dev',
      [
        'Portfolio Site',
        ['components', 'Header.tsx', 'Footer.tsx'],
        ['app', 'page.tsx', 'layout.tsx'],
        'package.json',
      ],
    ],
    [
      'Math Algorithms',
      ['Dijkstra', 'dijkstra.js', 'graph.js', 'test.js'],
      ['Sorting', 'quicksort.py', 'mergesort.java'],
      { starred: true },
    ],
    'research_paper.pdf', // Top-level file
    'meeting_notes.md',
  ],
};

// --- Home Panel Data ---
export interface HomeActivityItem {
  id: string;
  icon?: React.ReactNode; // Optional icon
  label: string;
  detail: string;
  href?: string; // For potential navigation
}

export interface HomeProjectItem {
  id: string;
  name: string;
  badge: string;
  lastActive: string;
  starred?: boolean;
  href?: string; // For potential navigation
}

export const mockHomeActivity: HomeActivityItem[] = [
  {
    id: 'act-1',
    icon: <HomeIcon color="green" />,
    label: 'Joined ML room',
    detail: '2h ago',
    href: '#',
  },
  {
    id: 'act-2',
    icon: <FileTextIcon color="blue" />, //
    label: 'Started Graph Theory project',
    detail: '1d ago',
    href: '#',
  },
  {
    id: 'act-3',
    icon: <FileTextIcon color="purple" />,
    label: 'Added note on AI Ethics',
    detail: '3d ago',
    href: '#',
  },
];

export const mockHomeProjects: HomeProjectItem[] = [
  {
    id: 'proj-math',
    name: 'Math Algorithms',
    badge: 'Math',
    lastActive: '2h ago',
    starred: true,
    href: '/projects/math-algorithms', // Example: Link to actual route path
  },
  {
    id: 'proj-ai',
    name: 'Neural Network',
    badge: 'AI/ML',
    lastActive: '1d ago',
    starred: false,
    href: '/projects/ai-projects/neural-network', // Example nested path
  },
  {
    id: 'proj-web',
    name: 'Portfolio Site',
    badge: 'Web Dev',
    lastActive: '5m ago',
    starred: false,
    href: '/projects/web-dev/portfolio-site', // Example nested path
  },
];

// --- Notes Panel Data ---
export interface Note {
  id: string;
  title: string;
  snippet: string;
  timestamp: string;
  type: 'solo' | 'group';
}

export const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: 'AI Ethics Idea',
    snippet: 'Initial thoughts on bias detection and mitigation strategies...',
    timestamp: '10m ago',
    type: 'solo',
  },
  {
    id: 'note-2',
    title: 'Meeting Notes - Sync',
    snippet: 'Discussed roadmap adjustments for Q3, focusing on scalability.',
    timestamp: '1h ago',
    type: 'group',
  },
  {
    id: 'note-3',
    title: 'React Hooks Cheatsheet',
    snippet:
      'Covering useState, useEffect, useContext, useReducer, and custom hooks.',
    timestamp: '2d ago',
    type: 'solo',
  },
  {
    id: 'note-4',
    title: 'Project Brainstorm: LearnSphere v2',
    snippet:
      'Ideas for next project iteration, including gamification and collaborative features.',
    timestamp: '5d ago',
    type: 'group',
  },
];

// --- Education Panel Data ---
export interface EducationResource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'guide' | 'course' | string; // Allow string for flexibility
  topic: 'Math' | 'AI/ML' | 'Web Dev' | string; // Allow string
}

export const mockEducation: EducationResource[] = [
  { id: 'edu-1', title: 'Graph Theory 101', type: 'video', topic: 'Math' },
  {
    id: 'edu-2',
    title: 'Intro to Transformers',
    type: 'article',
    topic: 'AI/ML',
  },
  {
    id: 'edu-3',
    title: 'React Best Practices',
    type: 'guide',
    topic: 'Web Dev',
  },
  {
    id: 'edu-4',
    title: 'Advanced Sorting Techniques',
    type: 'course',
    topic: 'Math',
  },
  {
    id: 'edu-5',
    title: 'Building Scalable APIs',
    type: 'video',
    topic: 'Web Dev',
  },
  {
    id: 'edu-6',
    title: "Understanding RNN's",
    type: 'article',
    topic: 'AI/ML',
  },
];

// --- Account Data (Example - Add if needed) ---
// export interface AccountSettings {
//   notifications: boolean;
//   theme: 'light' | 'dark' | 'system';
// }

// export const mockAccountSettings: AccountSettings = {
//   notifications: true,
//   theme: 'system',
// };
