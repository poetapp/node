import { FindOneOptions } from 'mongodb'

// TODO: see https://github.com/DefinitelyTyped/DefinitelyTyped/pull/22045/files

declare module 'mongodb' {
  export interface Collection<TSchema = any> {
    findOne<T = TSchema>(filter: Object, fields?: {readonly [key: string]: boolean}, options?: FindOneOptions): Promise<T | null>;
  }
}
