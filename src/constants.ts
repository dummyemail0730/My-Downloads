import { Project, Track, Photo, Tool } from './types';
import shadowOnRoof from './assets/images/shadow_on_roof_1779250618867.png';
import shadowDarkBlade from './assets/images/shadow_dark_blade_1779250640689.png';
import shadowMysteriousAura from './assets/images/shadow_mysterious_aura_1779250659900.png';
import shadowMoonRain from './assets/images/shadow_moon_rain_1779250676888.png';
import shadowNeonElectricity from './assets/images/shadow_neon_electricity_1779250694461.png';
import shadowClockTower from './assets/images/shadow_clock_tower_1779250710506.png';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'G.S. W11 ISO',
    description: 'all-in-one, bootable Windows Preinstallation Environment (WinPE)',
    tags: ['Rust', 'Vulkan', 'Graphics'],
    image: shadowOnRoof,
    link: 'https://drive.google.com/file/d/1JPS3xKOMEzrKTg0Ux0JZDe3TJoHtnBxY/view?usp=sharing',
  },
  {
    id: '2',
    title: 'G.S W10 ISO',
    description: 'Ghost Spectre ISO',
    tags: ['OS', 'Utility', 'Windows'],
    image: shadowDarkBlade,
    link: 'https://drive.google.com/file/d/1-eZazHgsDtT0xAW94L2woWfK4sbFPC71/view?usp=sharing',
  },
  {
    id: '3',
    title: 'Microsoft Office',
    description: 'Complete productivity suite featuring Microsoft Word, Excel, PowerPoint, and Outlook pre-activated and pre-configured.',
    tags: ['Office', 'Utility', 'Productivity'],
    image: shadowMysteriousAura,
    link: 'https://drive.google.com/file/d/1JOkYke7BPH_i8A6biBkw3hclsnAwFrOv/view?usp=sharing',
  },
  {
    id: '4',
    title: 'Omni Script',
    description: 'Custom scripting language for procedural animation and generative architecture patterns.',
    tags: ['LLVM', 'Compiler', 'Generative'],
    image: shadowMoonRain,
  },
  {
    id: '5',
    title: 'Aether CMS',
    description: 'Headless content management system with a focus on developer experience and speed.',
    tags: ['Go', 'PostgreSQL', 'API'],
    image: shadowNeonElectricity,
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
  { id: '1', url: shadowOnRoof, caption: 'Shadow on the Roof', location: 'Midgar Kingdom' },
  { id: '2', url: shadowDarkBlade, caption: 'Ian Collantes’s Blade', location: 'Shadow Garden HQ' },
  { id: '3', url: shadowMysteriousAura, caption: 'I Am Atomic Aura', location: 'Sanctuary' },
  { id: '4', url: shadowMoonRain, caption: 'Midnight Rain Shadow', location: 'Alexia Castle' },
  { id: '5', url: shadowNeonElectricity, caption: 'Overdrive Energy Core', location: 'Corporate Sector' },
  { id: '6', url: shadowClockTower, caption: 'Clock Tower Sentinel', location: 'Lawless City' },
];

export const TOOLS: Tool[] = [
  { id: '1', name: 'TECHNICAL TOOLKIT', version: '2.4.0', description: 'all-in-one, bootable Windows Preinstallation Environment (WinPE)', category: 'W10 & W11' },
  { id: '2', name: '3DP CHIP', version: '1.2.1', description: 'driver utility', category: 'W10 & OLDER' },
  { id: '3', name: 'DDU', version: '0.8.5', description: 'Display Driver Uninstaller', category: 'W11, W10, W8, W7,' },
  { id: '4', name: 'CPU-Z', version: '1.0.2', description: 'system profiling and monitoring utility', category: 'W11, W10, W8,W7, Vista, & XP' },
  { id: '6', name: 'RUFUS', version: '4.1.0', description: 'utility that helps format and create bootable USB flash drives', category: 'W11, W10' },
  { id: '7', name: 'MEMTEST86', version: '1.0.0', description: 'The absolute standard for system memory diagnostics and RAM stability testing.', category: 'MEMORY' }
];
