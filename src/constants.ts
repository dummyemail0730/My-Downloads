import { Project, Track, Photo, Tool } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'G.S. W11 ISO',
    description: 'A high-performance real-time raytracing renderer for distributed systems using Rust and Vulkan.',
    tags: ['Rust', 'Vulkan', 'Graphics'],
  },
  {
    id: '2',
    title: 'USB All in 1 tool kit',
    description: 'A minimalist design system component library for enterprise dashboard applications.',
    tags: ['React', 'Tailwind', 'Design Systems'],
  },
  {
    id: '3',
    title: 'Nexus DB',
    description: 'High-concurrency time-series database optimized for financial telemetry and ultra-low latency.',
    tags: ['C++', 'NoSQL', 'Database'],
  },
  {
    id: '4',
    title: 'Omni Script',
    description: 'Custom scripting language for procedural animation and generative architecture patterns.',
    tags: ['LLVM', 'Compiler', 'Generative'],
  },
  {
    id: '5',
    title: 'Aether CMS',
    description: 'Headless content management system with a focus on developer experience and speed.',
    tags: ['Go', 'PostgreSQL', 'API'],
  },
  {
    id: '6',
    title: 'Nova Dashboard',
    description: 'Real-time analytics engine with modular layout components and D3 integrations.',
    tags: ['TypeScript', 'D3.js', 'React'],
  }
];

export const TRACKS: Track[] = [
  { id: '1', title: 'Midnight Echo', artist: 'Silent Path', duration: '3:45', genre: 'Ambient' },
  { id: '2', title: 'Neon Pulse', artist: 'Circuit Mind', duration: '4:20', genre: 'Synthwave' },
  { id: '3', title: 'Glass Horizon', artist: 'Ethereal', duration: '5:12', genre: 'Post-Rock' },
  { id: '4', title: 'Urban Rain', artist: 'Lo-Fi Night', duration: '2:58', genre: 'Lo-Fi' },
  { id: '5', title: 'Static Dreams', artist: 'Digital Dust', duration: '3:12', genre: 'Glitch' },
  { id: '6', title: 'Lunar Drift', artist: 'Orbital', duration: '6:30', genre: 'Deep Space' },
];

export const PHOTOS: Photo[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e', caption: 'Golden Hour in Kyoto', location: 'Japan' },
  { id: '2', url: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad', caption: 'Golden Gate Bridge Fog', location: 'San Francisco' },
  { id: '3', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', caption: 'Misty Alpine Peaks', location: 'Switzerland' },
  { id: '4', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', caption: 'Mirror Lake Reflection', location: 'Yosemite' },
  { id: '5', url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e', caption: 'Rural Horizon', location: 'Italy' },
  { id: '6', url: 'https://images.unsplash.com/photo-1433838552652-f9a46b332c40', caption: 'Floating Balloons', location: 'Cappadocia' },
];

export const TOOLS: Tool[] = [
  { id: '1', name: 'TECHNICAL TOOLKIT', version: '2.4.0', description: 'modified version of Windows 11 designed to be lightweight', category: 'W10 & W11' },
  { id: '2', name: '3DP CHIP', version: '1.2.1', description: 'driver utility', category: 'W10 & OLDER' },
  { id: '3', name: 'DDU', version: '0.8.5', description: 'Display Driver Uninstaller', category: 'W11, W10, W8, W7,' },
  { id: '4', name: 'CPU-Z', version: '1.0.2', description: 'system profiling and monitoring utility', category: 'W11, W10, W8,W7, Vista, & XP' },
];
