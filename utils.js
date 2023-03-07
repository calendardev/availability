import request from 'superagent';
// const base = "https://updock.co/";
const base = "https://calendar.dev";
const apiBase = "api";

export default function(token) {
  const utils = {
    _buildHeaders(req, options) {
      if(options?.headers) {
        for(let key of Object.keys(options.headers)) {
          req = req.set(key, options.headers[key])
        }
      }
      return req;
    },
    _buildApiRoot(route, options) {
      return this._api(route, {noApi: options?.noApi});
    },
    _api(route, options) {
      if(options.noApi) {
        return `${base}/${route}`;  
      }
      return `${base}/${apiBase}/${route}`;
    },
    
    get(route, data, options) {
      let req = request
              .get(this._buildApiRoot(route, options))
              .set('Accept', 'application/json')
              .auth(token, { type: "bearer" })
      req = this._buildHeaders(req, options);
      return req.send(data)
    },

    post(route, data, options) {
      let req = request
              .post(this._buildApiRoot(route, options))
              .send(data) 
              .set('Accept', 'application/json')
              .auth(token, { type: "bearer" })

      req = this._buildHeaders(req, options);
      return req.send(data)
    }
  }

  return utils
}