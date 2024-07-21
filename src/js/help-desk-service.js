import BaseService from './base-service';

export default class HelpDeskService extends BaseService {
  constructor() { super(import.meta.env.BACKEND_URL || 'http://localhost:7070'); }

  allTickets() { return this.get('/?method=allTickets'); }

  createTicket(data) { return this.post('/?method=createTicket', data); }

  deleteById(id) { return this.get(`/?method=deleteById&id=${id}`); }

  ticketById(id) { return this.get(`/?method=ticketById&id=${id}`); }

  updateById(id, data) { return this.post(`/?method=updateById&id=${id}`, data); }
}
