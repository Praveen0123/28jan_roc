import { QueryResult } from 'pg';


export class RoiModelMapper
{

  static toRoiModel<T>(queryResult: QueryResult<T>, key: string): T
  {
    return JSON.parse(JSON.stringify(queryResult.rows[0][key]));
  }


  static toRoiModelList<T>(queryResult: QueryResult<T>, key: string): T[]
  {
    const list: T[] = [];

    queryResult.rows.map((row: any) => list.push(JSON.parse(JSON.stringify(row[key]))));

    return list;
  }
}
