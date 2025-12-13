import type { Nullable } from './nullable';

export interface SuccessResponse {
  success: boolean;
  data: Nullable<any> | any[];
  code: string;
  message: string;
  messageCode: string;
  pagination: Nullable<{
    page: Nullable<number>;
    pageSize: Nullable<number>;
    total: Nullable<number>;
  }>;
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

/// Proposed new type for general API response

// --------------------------------------
// Alert / Message Level
// --------------------------------------
export enum ResponseStatus {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
}

// --------------------------------------
// Allowed Actions
// --------------------------------------
export enum ActionType {
  READ = 'read',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  EXPORT = 'export',
  APPROVE = 'approve',
}

// --------------------------------------
// Action Restrictions
// --------------------------------------
export interface ActionRestrictions {
  [ActionType.READ]?: boolean;
  [ActionType.CREATE]?: boolean;
  [ActionType.EDIT]?: boolean;
  [ActionType.DELETE]?: boolean;
  [ActionType.EXPORT]?: boolean;
  [ActionType.APPROVE]?: boolean;
}

// --------------------------------------
// Response Metadata
// --------------------------------------
export interface ResponseMeta {
  timestamp?: string;
  missingFields?: string[];
  actionRestrictions?: ActionRestrictions;

  // extensibility point
  [key: string]: unknown;
}

// --------------------------------------
// Generic API Response
// --------------------------------------
export interface ApiResponse<T> {
  status: ResponseStatus;
  message: string;
  code: string;
  data: T | T[] | null;
  meta?: ResponseMeta;
  pagination: {
    page: number | null;
    pageSize: number | null;
    total: number | null;
  };
}

// EXAMPLE USAGE:
// const response: ApiResponse<UserProfile> = {
//   status: ResponseStatus.WARNING,
//   message: "Some fields are missing and should be filled manually.",
//   data: {
//     id: 55,
//     firstName: "Ardian",
//     lastName: "K."
//   },
//   meta: {
//     timestamp: "2025-12-09T14:00:00Z",
//     missingFields: [
//       "birthdate",
//       "phoneNumber"
//     ],
//     actionRestrictions: {
//       [ActionType.READ]: true,
//       [ActionType.CREATE]: false,
//       [ActionType.EDIT]: true,
//       [ActionType.DELETE]: false
//     }
//   }
// };
