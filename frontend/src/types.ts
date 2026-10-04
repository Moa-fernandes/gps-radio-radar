export interface RadioStation {
  name: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  streamUrl: string;
  genre: string;
  bitrate: string;
  listeners: number;
  tz: string;
}