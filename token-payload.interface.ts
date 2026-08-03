export interface TokenPayload {
  sub: string; // user id
  email: string;
  type: 'access' | 'refresh';
}