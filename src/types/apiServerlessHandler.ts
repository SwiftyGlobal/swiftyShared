import type { Handler } from 'aws-lambda/handler';
import type { APIGatewayProxyEventBase, APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';
import { JwtModel } from './jwtModel';

export type ApiServerlessHandlerEvent<TBody, KQuery, JParams> = {
  body: TBody;
  encryptedBody: TBody;
  queryStringParameters: KQuery;
  pathParameters: JParams;
  user?: JwtModel;
};

export type ApiServerlessHandler<TBody = null, KQuery = {}, JParams = {}> = Handler<
  APIGatewayProxyEventBase<any> & ApiServerlessHandlerEvent<TBody, KQuery, JParams>,
  APIGatewayProxyResult
>;
