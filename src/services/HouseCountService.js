import { HouseCountModel } from '../models/HouseCountModel';

export class HouseCountService {
  constructor() {
    this.model = new HouseCountModel();
  }

  calculateHouseNumbers(data, dates, totalHR, divisions) {
    return this.model.calculateAllHouseNumbers(data, dates, totalHR, divisions);
  }

  validateHouseTransition(fromHouse, toHouse) {
    return this.model.validateHouseTransition(fromHouse, toHouse);
  }

  getHouseSequence(fromHouse, toHouse) {
    return this.model.getHouseSequence(fromHouse, toHouse);
  }

  getHouseNumber(fromHouse, toHouse) {
    return this.model.calculateHouseNumber(fromHouse, toHouse);
  }
}