// this class must be abstract
export default class BaseService {
  constructor(baseURL) { this._baseURL = baseURL; }

  get(url) { return BaseService.fetch(this._baseURL + url, { method: 'GET' }); }

  post(url, data = new FormData()) { return BaseService.fetch(this._baseURL + url, { method: 'POST', body: data }); }

  static async fetch(input, init) {
    try {
      const response = await fetch(input, init);

      if (response.ok) {
        if (response.status === 204) {
          return { status: response.status };
        }

        return await response.json();
      }
      else {
        console.error('Ошибка:', await response.json());
      }
    } catch (error) {
      console.error(error);
    }
  }
}
