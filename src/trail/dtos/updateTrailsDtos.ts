export interface TrailInterface {
  order: number;
  _id: string;
  name?: string;
  journey?: string;
  contents?: string[];
  createdAt?: string;
  updatedAt?: string;
  _v?: number;
}

export class UpdateTrailsDtos {
  trails: TrailInterface[];
}
