export interface ComicPage {
  id: number;
  pageNumber: number;
  src: string;
  thumb: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface ComicManifest {
  title: string;
  totalPages: number;
  pages: ComicPage[];
}

export type ReaderMode = 'auto' | 'book' | 'webtoon';

export interface ReaderSettings {
  mode: ReaderMode;
  autoHideControls: boolean;
  theme: 'dark' | 'oled' | 'sepia';
  pageFit: 'contain' | 'height' | 'width';
}
