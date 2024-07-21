// this class must be abstract
export default class BaseService {
  constructor(baseURL) {
    this._baseURL = baseURL;
  }

  async get(url) {
    const response = await fetch(this._baseURL + url, { method: 'GET' });

    return await response.json();
  }
}