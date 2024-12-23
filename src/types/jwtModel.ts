import type { JwtTypes } from '@constants/jwtTypes';

export interface JwtModel {
  iat: number;
  exp: number;
  type: JwtTypes;
  id: number;
  sub: string;
  iss: string;
  client_id: string;
  origin_jti: string;
  event_id: string;
  token_use: string;
  scope: string;
  auth_time: number;
  jti: string;
  username: string;
}
