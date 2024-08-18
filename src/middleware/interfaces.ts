export interface JwtPayload {
  data: { sub: string; role: string; version: number };
}
