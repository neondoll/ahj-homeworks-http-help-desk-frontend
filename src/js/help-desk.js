import HelpDeskService from './help-desk-service';

export default class HelpDesk {
  constructor() {
    this._allTickets = [];
    this._container = undefined;
    this._element = undefined;
    this._list = undefined;
    this._modal = undefined;
    this._modalForm = undefined;
    this._modalTicket = undefined;
    this._modalTicketId = undefined;
    this._modalType = undefined;
    this._service = new HelpDeskService();

    this.onClickBtnAdd = this.onClickBtnAdd.bind(this);
    this.onClickList = this.onClickList.bind(this);
    this.onClickModal = this.onClickModal.bind(this);
    this.onResetModalForm = this.onResetModalForm.bind(this);
    this.onSubmitModalForm = this.onSubmitModalForm.bind(this);
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

  createModal() {
    document.body.insertAdjacentHTML('beforeend', HelpDesk.markupModal(this._modalType, this._modalTicket));

    this._modal = document.body.querySelector(HelpDesk.modalSelector);
    this._modalForm = this._modal.querySelector(HelpDesk.modalFormSelector);

    this._modal.addEventListener('click', this.onClickModal);
    this._modalForm.addEventListener('reset', this.onResetModalForm);
    this._modalForm.addEventListener('submit', this.onSubmitModalForm);
  }

  deleteModal() {
    this._modalForm.removeEventListener('submit', this.onSubmitModalForm);
    this._modalForm.removeEventListener('reset', this.onResetModalForm);
    this._modal.removeEventListener('click', this.onClickModal);
    this._modal.remove();

    this._modalTicketId = undefined;
    this._modalTicket = undefined;
    this._modalType = undefined;
    this._modalForm = undefined;
    this._modal = undefined;
  }

  drawUI() {
    this.checkBinding();

    this._container.innerHTML = HelpDesk.markup;
    this._element = this._container.querySelector(HelpDesk.selector);
    this._list = this._element.querySelector(HelpDesk.listSelector);

    this._element.querySelector(HelpDesk.btnAddSelector).addEventListener('click', this.onClickBtnAdd);
    this._list.addEventListener('click', this.onClickList);

    this._service.allTickets().then((data) => {
      if (data !== undefined) {
        this._allTickets = data;

        this.redrawDOM();
      }
    });
  }

  onClickBtnAdd() {
    this._modalTicketId = undefined;
    this._modalTicket = undefined;
    this._modalType = 'add';

    this.createModal();
  }

  onClickList(event) {
    if (event.target.closest(HelpDesk.ticketStatusSelector)) {
      this.onClickTicketStatus(event);
    }
    else if (event.target.closest(HelpDesk.ticketBtnEditSelector)) {
      this.onClickTicketBtnEdit(event);
    }
    else if (event.target.closest(HelpDesk.ticketBtnDeleteSelector)) {
      this.onClickTicketBtnDelete(event);
    }
    else if (event.target.closest(HelpDesk.ticketContentSelector)) {
      this.onClickTicketContent(event);
    }
  }

  onClickModal(event) {
    if (event.target.closest(HelpDesk.modalFormSelector)) {
      return;
    }

    this.deleteModal();
  }

  onClickTicketBtnDelete(event) {
    this._modalTicketId = event.target.closest(HelpDesk.ticketSelector).dataset.id;
    this._modalTicket = this._allTickets.find(ticket => ticket.id === this._modalTicketId);
    this._modalType = 'delete';

    this.createModal();
  }

  onClickTicketBtnEdit(event) {
    this._modalTicketId = event.target.closest(HelpDesk.ticketSelector).dataset.id;
    this._modalTicket = this._allTickets.find(ticket => ticket.id === this._modalTicketId);
    this._modalType = 'edit';

    this.createModal();
  }

  onClickTicketContent(event) {
    event.target.closest(HelpDesk.ticketSelector).classList.toggle('help-desk-ticket--show-description');
  }

  onClickTicketStatus(event) {
    const ticketId = event.target.closest(HelpDesk.ticketSelector).dataset.id;
    const ticketIndex = this._allTickets.findIndex(ticket => ticket.id === ticketId);
    const ticket = this._allTickets[ticketIndex];

    const formData = new FormData();
    formData.append('id', ticket.id);
    formData.append('name', ticket.name);
    formData.append('status', JSON.stringify(!ticket.status));
    formData.append('description', ticket.description);

    this._service.updateById(ticketId, formData).then((data) => {
      if (data !== undefined) {
        this._service.ticketById(data.id).then((data) => {
          this._allTickets[ticketIndex] = data;

          this.redrawDOM();
        });
      }
    });
  }

  onResetModalForm() { this.deleteModal(); }

  onSubmitModalForm(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    formData.append('id', this._modalTicket ? this._modalTicket.id : null);
    formData.append('status', JSON.stringify(this._modalTicket ? this._modalTicket.status : false));

    switch (this._modalType) {
      case 'add': {
        this._service.createTicket(formData).then((data) => {
          if (data !== undefined) {
            this.deleteModal();

            this._service.ticketById(data.id).then((data) => {
              this._allTickets.push(data);

              this.redrawDOM();
            });
          }
        });
        break;
      }
      case 'edit': {
        this._service.updateById(this._modalTicketId, formData).then((data) => {
          if (data !== undefined) {
            const ticketIndex = this._allTickets.findIndex(ticket => ticket.id === this._modalTicketId);

            this.deleteModal();

            this._service.ticketById(data.id).then((data) => {
              this._allTickets[ticketIndex] = data;

              this.redrawDOM();
            });
          }
        });
        break;
      }
      case 'delete': {
        this._service.deleteById(this._modalTicketId).then((data) => {
          if (data !== undefined) {
            this.deleteModal();

            this._service.allTickets().then((data) => {
              this._allTickets = data;

              this.redrawDOM();
            });
          }
        });
        break;
      }
    }
  }

  redrawDOM() {
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
        <ul class="help-desk__list">
          <li class="help-desk__item-loading">Загрузка...</li>
        </ul>
      </div>
    `;
  }

  static markupModal(type, ticket) {
    const title = type === 'add'
      ? 'Добавить тикет'
      : (type === 'edit'
          ? 'Изменить тикет'
          : (type === 'delete'
              ? 'Удалить тикет'
              : undefined));
    const content = type === 'delete'
      ? `<p class="help-desk-modal__description">Вы уверены, что хотите удалить тикет? Это действие необратимо.</p>`
      : `
        <div class="help-desk-modal__form-group">
          <label class="help-desk-modal__label" for="form-name">Краткое описание</label>
          <input class="help-desk-modal__input" id="form-name" name="name" value="${type === 'edit' ? ticket.name : ''}">
        </div>
        <div class="help-desk-modal__form-group">
          <label class="help-desk-modal__label" for="form-description">Подробное описание</label>
          <textarea class="help-desk-modal__textarea" id="form-description" name="description" rows="3">${type === 'edit' ? ticket.description : ''}</textarea>
        </div>
      `;

    return `
      <div class="help-desk-modal">
        <form class="help-desk-modal__form">
          <h2 class="help-desk-modal__title">${title}</h2>
          ${content}
          <div class="help-desk-modal__controls">
            <button class="help-desk-modal__btn-reset" type="reset">Отмена</button>
            <button class="help-desk-modal__btn-submit" type="submit">Ok</button>
          </div>
        </form>
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
        <span class="help-desk-ticket__content">
          <span class="help-desk-ticket__left">
            <button class="help-desk-ticket__status" type="button">${ticket.status ? '&#10004;' : ''}</button>
            <span class="help-desk-ticket__name">${ticket.name}</span>
          </span>
          <span class="help-desk-ticket__right">
            <time class="help-desk-ticket__created" datetime="${createdDatetime}">${createdValue}</time>
            <span class="help-desk-ticket__controls">
              <button class="help-desk-ticket__btn-edit" type="button">✎</button>
              <button class="help-desk-ticket__btn-delete" type="button">&#10006;</button>
            </span>
          </span>
        </span>
        <span class="help-desk-ticket__description">${ticket.description || '<i>(Нет данных)</i>'}</span>
      </li>
    `;
  }

  static get btnAddSelector() { return '.help-desk__btn-add'; }

  static get listSelector() { return '.help-desk__list'; }

  static get modalSelector() { return '.help-desk-modal'; }

  static get modalFormSelector() { return '.help-desk-modal__form'; }

  static get selector() { return '.help-desk'; }

  static get ticketBtnDeleteSelector() { return '.help-desk-ticket__btn-delete'; }

  static get ticketBtnEditSelector() { return '.help-desk-ticket__btn-edit'; }

  static get ticketContentSelector() { return '.help-desk-ticket__content'; }

  static get ticketSelector() { return '.help-desk-ticket'; }

  static get ticketStatusSelector() { return '.help-desk-ticket__status'; }
}
