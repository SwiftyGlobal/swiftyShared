import type { Nullable } from './nullable';

export interface SuccessResponse {
  success: boolean;
  data: Nullable<any> | any[];
  code: string;
  message: string;
  messageCode: string;
}

export interface ErrorResponse {
  message: string;
  success: boolean;
  code: string;
  extra_data: Nullable<any>;
  type: Nullable<any>;
  message_code: string;
  error: {
    message: string;
    success: boolean;
    code: string;
    extra_data: Nullable<any>;
    type: Nullable<any>;
    message_code: string;
  };
}
