import publicationsData from './publications.json';
import teachingData from './teaching.json';
import seminarsData from './seminars.json';
import talksData from './talks.json';

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
  id: number;
  title: string;
  authors: string;
  correspondingAuthors?: string[];
  firstAuthors?: string[];
  guidedStudents?: string[];
  venue: string;
  type: 'Conference' | 'Journal' | 'Preprint' | 'Software';
  year: string;
  abs?: string;
  keywords?: string[];
  pdf?: string;
  code?: string;
  url?: string; // arxiv 或其他链接
  selected?: boolean;
}

export interface Teaching {
  id: string;
  title: string;
  type: string;
  role: string;
  venue: string;
  date: string;
  semester?: string;
  excerpt?: string;
  body?: string;
  permalink?: string;
}

export interface Seminar {
  id: string;
  title: string;
  type: string;
  venue: string;
  date: string;
  location?: string;
  excerpt?: string;
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
  show?: boolean;
}

export interface Content {
  profile: Profile;
  news: { date: string; content: string }[];
  publications: Publication[];
  teaching: Teaching[];
  seminars: Seminar[];
  talks: Talk[];
  services: { type: string; items: string[] }[];
}

export const HAO_DATA: Content = {
  profile: {
    name: "Hao Zeng",
    cnName: "曾浩",
    title: "Postdoctoral Researcher in Statistics",
    university: "Southern University of Science and Technology (SUSTech) and National University of Singapore (NUS)",
    email: "zenghao.acmail@gmail.com",
    googleScholar: "https://scholar.google.com/citations?user=-EiBHeIAAAAJ&hl=en",
    github: "https://github.com/zenghao-stat",
    location: "Shenzhen, China",
    description: "I am currently a **Postdoctoral in Statistics** at the Southern University of Science and Technology (**SUSTech**) and National University of Singapore (**NUS**), Department of Statistics and Data Science, supported by the **SUSTech-NUS Joint Research Program**, supervised by Prof. Bingyi Jing, Prof. Hongxin Wei, and Prof. Wang Zhou. I obtained my **PhD in Statistics** from Gregory and Paula Chow Institute for Studies in Economics, **Xiamen University** in 2024. My research focuses on **model free statistical machine learning** theory, methods, and their applications on **predictive inference**. I am also interested in interdisciplinary research at the intersection of machine learning methodologies with **large language model**, **spatial statistics**, **econometrics**, and **biostatistics**.",
    cvUrl: "https://zenghao-stat.github.io/cv_folder/cv.pdf",
    teachingUrl: "#teaching",
    seminarsUrl: "#seminar",
    avatarUrl: "./images/profile.jpg"
  },
  news: [
    {
      date: "2025/11",
      content: "Our paper \"Transfer Learning for Spatial Autoregressive Models with Application to U.S. Presidential Election Prediction\" has been accepted to Journal of Business & Economic Statistics!"
    },
    {
      date: "2025/09",
      content: "Our paper \"Robust Online Conformal Prediction under Uniform Label Noise\" has been accepted to NeurIPS 2025!"
    },
    {
      date: "2025/05",
      content: "Our paper \"Parametric Scaling Law of Tuning Bias in Conformal Prediction\" has been accepted to ICML 2025!"
    },
    {
      date: "2024/07",
      content: "Started postdoctoral position at the Department of Statistics and Data Science, SUSTech under the SUSTech-NUS Joint Research Program."
    },
    {
      date: "2024/06",
      content: "Graduated with a Ph.D. in Statistics from Gregory and Paula Chow Institute for Studies in Economics, Xiamen University."
    }
  ],
  // 从 publications.json 导入论文数据
  publications: publicationsData as Publication[],
  teaching: teachingData as Teaching[],
  seminars: seminarsData as Seminar[],
  talks: talksData as Talk[],
  services: [
    {
      type: 'Conference Reviewer',
      items: [
        'NeurIPS (2024, 2025)',
        'ICML (2024, 2025)',
        'ICLR (2025, 2026)',
        'AISTATS (2024)',
      ],
    },
  ],
};
