export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  image?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  genre: string;
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  location: string;
}

export interface Tool {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  link?: string;
  image?: string;
}
