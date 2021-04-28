import { Entity, UniqueEntityID } from '@vantage-point/ddd-core';

export class RocAggregateId extends Entity<any>
{
  get id(): UniqueEntityID
  {
    return this._id;
  }

  private constructor(id?: UniqueEntityID)
  {
    super(null, id);
  }

  public static create(id?: UniqueEntityID | string): RocAggregateId
  {
    if (id instanceof UniqueEntityID)
    {
      return new RocAggregateId(id);
    }

    return new RocAggregateId(UniqueEntityID.create(id));
  }
}
