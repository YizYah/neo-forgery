
export interface Parameters {
  [key: string]: any
}

export interface ParamInfo {
  params: Parameters
  isMultiple?: boolean
  currentResponse?: number
  responses: any[]
}

export interface SessionInfo {
  [query: string]: ParamInfo[];
}
