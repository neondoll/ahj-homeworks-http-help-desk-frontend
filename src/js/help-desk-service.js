import BaseService from './base-service';

export default class HelpDeskService extends BaseService {
  constructor() { super('http://localhost:7070'); }

  allTickets() {
    return this.get('/?method=allTickets');
  }
}