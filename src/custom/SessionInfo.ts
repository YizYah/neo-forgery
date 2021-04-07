
export interface ParamInfo {
  params: {}
  isMultiple?: boolean
  currentResponse?: number
  responses: any[]
}

export interface SessionInfo {
  [query: string]: ParamInfo[];
}
