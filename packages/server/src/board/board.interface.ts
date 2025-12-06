export interface Pixel {
  x: number;
  y: number;
  color: string;
}

export interface User {
  id: string; // socket id
  userId: string;
  nickname: string;
  x: number;
  y: number;
  color: string;
}
