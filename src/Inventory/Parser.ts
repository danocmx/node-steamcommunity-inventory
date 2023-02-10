import { Inventory } from '../Inventory';
import { EconItem, Asset, Description } from './types';

export type ToEconParams = {
  assets: Asset[];
  descriptions: Description[];
};

export class Parser<T> {
  constructor(private inventory: Inventory<T>) {}

  toEconNew({ assets, descriptions }: ToEconParams) {
    const descriptionsDict: Record<string, Description> = {};
    for (let i = 0; i < descriptions.length; i++) {
      const description = descriptions[i];
      const classId = description.classid;
      const instanceId = description.instanceid;
      descriptionsDict[`${classId}_${instanceId}`] = description;
    }

    const inventory: T[] = [];
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      const classId = asset.classid;
      const instanceId = asset.instanceid;
      const description = descriptionsDict[`${classId}_${instanceId}`];

      inventory.push(
        this.format({
          ...asset,
          ...description,
        }),
      );
    }

    return inventory;
  }

  format(econItem: EconItem): T {
    return this.inventory.formatter
      ? this.inventory.formatter(econItem)
      : (econItem as unknown as T);
  }
}
