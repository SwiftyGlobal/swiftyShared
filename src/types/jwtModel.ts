import { JwtTypes } from '../common';

export interface JwtModel {
  iat: number;
  exp: number;
  type: JwtTypes;
  id: number;
}
