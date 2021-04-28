import { Entity, UniqueEntityID } from '@vantage-point/ddd-core';

export class RocModelId extends Entity<any>
{
  get id(): UniqueEntityID
  {
    return this._id;
  }

  private constructor(id?: UniqueEntityID)
  {
    super(null, id);
  }

  public static create(id?: UniqueEntityID | string): RocModelId
  {
    if (id instanceof UniqueEntityID)
    {
      return new RocModelId(id);
    }

    return new RocModelId(UniqueEntityID.create(id));
  }
}
