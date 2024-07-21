import HelpDeskService from './help-desk-service';

export default class HelpDesk {
  constructor() {
    this._allTickets = [];
    this._container = undefined;
    this._element = undefined;
    this._list = undefined;
    this._service = new HelpDeskService();
  }

  bindToDOM(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('container is not HTMLElement');
    }

    this._container = container;
  }

  checkBinding() {
    if (this._container === undefined) {
      throw new Error('HelpDesk not bind to DOM');
    }
  }

  drawUI() {
    this.checkBinding();

    this._container.innerHTML = HelpDesk.markup;
    this._element = this._container.querySelector(HelpDesk.selector);
    this._list = this._element.querySelector(HelpDesk.listSelector);

    this.redrawDOM();
  }

  async redrawDOM() {
    this._allTickets = await this._service.allTickets();
    console.log(this._allTickets);

    this._list.innerHTML = '';

    this._allTickets.forEach((ticket) => {
      this._list.insertAdjacentHTML('beforeend', HelpDesk.markupTicket(ticket));
    });
  }

  static get markup() {
    return `
      <div class="help-desk">
        <div class="help-desk__header">
          <button class="help-desk__btn-add" type="button">Добавить тикет</button>
        </div>
        <ul class="help-desk__list"></ul>
      </div>
    `;
  }

  static markupTicket(ticket) {
    const created = new Date(ticket.created);
    const createdYear = created.getFullYear();
    const createdMonth = String(created.getMonth() + 1).padStart(2, '0');
    const createdDay = String(created.getDate()).padStart(2, '0');
    const createdHour = String(created.getHours()).padStart(2, '0');
    const createdMinute = String(created.getMinutes()).padStart(2, '0');
    const createdSecond = String(created.getSeconds()).padStart(2, '0');

    const createdDatetime = `${createdYear}-${createdMonth}-${createdDay}T${createdHour}:${createdMinute}:${createdSecond}`;
    const createdValue = `${createdDay}.${createdMonth}.${createdYear} ${createdHour}:${createdMinute}:${createdSecond}`;

    return `
      <li class="help-desk__item help-desk-ticket" data-id="${ticket.id}">
        <span class="help-desk-ticket__left">
          <span class="help-desk-ticket__status">${ticket.status ? '&#10004;' : ''}</span>
          <span class="help-desk-ticket__name">${ticket.name}</span>
        </span>
        <span class="help-desk-ticket__right">
          <time class="help-desk-ticket__created" datetime="${createdDatetime}">${createdValue}</time>
          <span class="help-desk-ticket__controls">
            <button class="help-desk-ticket__btn-edit" type="button">&#9998;</button>
            <button class="help-desk-ticket__btn-delete" type="button">&#10006;</button>
          </span>
        </span>
      </li>
    `;
  }

  static get listSelector() { return '.help-desk__list'; }

  static get selector() { return '.help-desk'; }
}