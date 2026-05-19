import profileData from '../content/profile.json';
import newsData from '../content/news.json';
import publicationsData from '../content/publications.json';
import researchData from '../content/research.json';
import blogData from './blog.json';
import teachingData from './teaching.json';
import seminarsData from './seminars.json';
import talksData from './talks.json';
import academicServiceData from '../content/academic_service.json';

export interface Profile {
  name: string;
  cnName?: string;
  title: string;
  university: string;
  location: string;
  description: string;
  email: string;
  googleScholar: string;
  github: string;
  siteUrl?: string;
  cvUrl?: string;
  teachingUrl?: string;
  seminarsUrl?: string;
  avatarUrl?: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  correspondingAuthors?: string[];
  firstAuthors?: string[];
  guidedStudents?: string[];
  venue: string;
  type: 'Conference' | 'Journal' | 'Preprint' | 'Software';
  year: string;
  month?: string;
  abs?: string;
  tag?: string[];
  keywords?: string[];
  pdf?: string;
  code?: string;
  url?: string; // arxiv 或其他链接
  selected?: boolean;
}

export interface Teaching {
  id: string;
  category?: string;
  title: string;
  type: string;
  role: string;
  venue: string;
  date: string;
  semester?: string;
  excerpt?: string;
  location?: string;
  tags?: string[];
  body?: string;
  permalink?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  topic?: string;
  tags?: string[];
  readTime?: string;
  excerpt: string;
  highlights?: string[];
  permalink?: string;
}

export interface Seminar {
  id: string;
  category?: string;
  title: string;
  type: string;
  role?: string;
  venue: string;
  date: string;
  location?: string;
  excerpt?: string;
  semester?: string;
  tags?: string[];
  body?: string;
  permalink?: string;
}

export interface Talk {
  id: string;
  title: string;
  type: string;
  venue: string;
  date: string;
  location: string;
  summary?: string;
  tags?: string[];
  show?: boolean;
}

export interface AcademicServiceItem {
  name: string;
  note?: string;
  year?: string[];
}

export interface AcademicServiceGroup {
  type: string;
  items: AcademicServiceItem[];
}

export interface ResearchNarrativeItem {
  text: string;
  citations?: string[];
}

export interface ResearchArea {
  id: string;
  title: string;
  summary: string;
  narrative: ResearchNarrativeItem[];
  imageUrl?: string;
}

export interface ResearchContent {
  intro: ResearchNarrativeItem[];
  areas: ResearchArea[];
}

export interface Content {
  profile: Profile;
  news: { date: string; content: string }[];
  research: ResearchContent;
  blog: BlogPost[];
  publications: Publication[];
  teaching: Teaching[];
  seminars: Seminar[];
  talks: Talk[];
  services: AcademicServiceGroup[];
}

export const HAO_DATA: Content = {
  profile: profileData as Profile,
  news: newsData as { date: string; content: string }[],
  research: researchData as ResearchContent,
  blog: blogData as BlogPost[],
  publications: (
    publicationsData as unknown as Array<
      Omit<Publication, 'tag'> & { tag?: string | string[] }
    >
  ).map(pub => ({
    ...pub,
    tag: Array.isArray(pub.tag) ? pub.tag : pub.tag ? [pub.tag] : [],
  })),
  teaching: teachingData as Teaching[],
  seminars: seminarsData as Seminar[],
  talks: talksData as Talk[],
  services: academicServiceData as AcademicServiceGroup[],
};
