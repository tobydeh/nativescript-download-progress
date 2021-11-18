export type RequestOptions = {
  method?: string;
  headers?: Record<string, any>;
};

export type ProgressCallback = (progress: number, url: string, destination: string) => void;
