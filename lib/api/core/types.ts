export interface ApiEnvelope<T> {
  status?: boolean;
  data: T;
  timestamp?: string;
  path?: string;
}
