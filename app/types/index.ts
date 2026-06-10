export interface EBookParams {
  topic: string;
  category: string;
  targetAudience: string;
  tone: string;
  includeOutline: boolean;
  pageRange: string;
}

export interface ChapterOutline {
  title: string;
  subtopics: string[];
}

export interface OutlineOption {
  id: number;
  title: string;
  chapters: ChapterOutline[];
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AgentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  retryable: boolean;
}

export interface TextStyle {
  fontFamily: string;
  color: string;
  fontSize: number; 
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  isGradient: boolean;
  gradientStartColor?: string;
  gradientEndColor?: string;
  gradientDirection?: 'to right' | 'to bottom' | 'to bottom right';
}

export interface ElementPosition {
  x: number; 
  y: number; 
  w: number; 
  h: number; 
}

export interface BookElement {
  id: string;
  text: string;
  style: TextStyle;
  position: ElementPosition;
}

export interface BookPage {
  id: string; 
  type: 'cover_front' | 'toc' | 'content' | 'cover_back' | 'chapter_title';
  title: string;
  content: string; 
  pageNumber?: number;
  imageUrl?: string; 
  
  titleStyle?: TextStyle;
  contentStyle?: TextStyle;
  
  titlePosition?: ElementPosition;
  contentPosition?: ElementPosition;

  extraElements?: BookElement[];
  
  isFreeLayout?: boolean; 
  layoutPreset?: 'center' | 'top' | 'bottom' | 'split';
  
  overlayBlur?: number; 
  overlayOpacity?: number; 
  
  isSaved?: boolean; 
  isFactChecked?: boolean;
}

export interface GeneratedBook {
  title: string;
  pages: BookPage[];
}
