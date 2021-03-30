import { parse, stringify } from 'qs'

export const objectToQuery = (object: Object): string => {
  return (stringify(object))
}

export const queryToObject = <T>(query: string): T => {
  return parse(query, { ignoreQueryPrefix: true }) as unknown as T
}