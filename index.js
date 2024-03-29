import axios from 'axios';

export default (options = {}, events = {}) => {
  return {
    __events: events,
    __options: options,
    events(events, replace = false){
      if (!replace) this.__events = {
        ...this.__events,
        ...events
      };
      else this.__events = events;
    },

    options(options, replace = false){
      if (!replace) this.__options = {
        ...this.__options,
        ...options
      };
      else this.__options = options;
    },

    create(options, events = {}){
      let __events = {
        ...this.__events,
        ...events
      };

      let __options = {
        ...this.__options,
        ...options
      };
  
      let ob = {
        __options: {
          headers: {},
          payload: {},
          config: {},
          path: '',
          domain: '',
          method: '',
          ...__options,
          keys: {
            storage_auth: '__a',
            request_auth: 'authorization',
            response_auth: 'authorization',

            request_view_id: 'view-id',
            response_view_id: 'view-id',
            storage_view_id: '__vid',

            request_locale: 'locale',
            response_locale: 'locale',
            storage_locale: '__locale',
            ...(__options.keys || {})
          },
        },
        __events,

        events(e){
          this.__events = {
            ...this.__events,
            ...e
          };
        },
      
        path(p) {
          this.__options.path = p;
          return this;
        },
      
        domain(d){
          this.__options.domain = d;
          return this;
        },
      
        config(config, repl = false) {
          if (repl) this.__options.config = config;
          else this.__options.config = {
            ...this.__options.config,
            ...config
          };
      
          return this;
        },
      
        keys(keys){
          this.__options.keys = {
            ...this.__options.keys,
            ...keys
          };
      
          return this;
        },
      
        headers(headers, repl = false) {
          if (repl) this.__options.headers = headers;
          else this.__options.headers = {
            ...this.__options.headers,
            ...headers
          };
      
          return this;
        },
      
        method(name) {
          this.__options.method = name;
          return this;
        },
      
        payload(payload) {
          this.__options.payload = payload;
          return this;
        },
      
        authorization(token, save = false){
          if (token && save) localStorage.setItem(this.__options.keys.storage_auth, token);
          token = token || localStorage.getItem(this.__options.keys.storage_auth);
      
          if (token) {
            this.__options.headers[this.__options.keys.request_auth] = token;
          }
      
          return this;
        },
        
        viewid(vid, save = false){
          if (vid && save) localStorage.setItem(this.__options.keys.storage_view_id, vid);
          let viewer = vid || localStorage.getItem(this.__options.keys.storage_view_id);
      
          if (viewer) this.__options.headers[this.__options.keys.request_view_id] = viewer;
      
          return this;
        },

        locale(data, save = false){
          if (data && save) localStorage.setItem(this.__options.keys.storage_locale, data);
          let locale = data || localStorage.getItem(this.__options.keys.storage_locale);
      
          if (locale) this.__options.headers[this.__options.keys.request_locale] = locale;
      
          return this;
        },

        async call() {
          try {
            if (this.__events.beforeRequest) this.__events.beforeRequest(this, this.__options);
            let method = this.__options.method.toUpperCase();
            let { payload, headers, config, path, domain } = this.__options;
            let res;
            let url = `${domain}/${path}`;
      
            if (method === 'POST') {
              res = await axios.post(url, payload, {
                ...config,
                headers
              });
            } else if (method === 'PUT') {
              res = await axios.put(url, payload, {
                ...config,
                headers
              });
            } else if (method === 'DELETE') {
              res = await axios.delete(url, {
                ...config,
                headers,
                data: payload
              });
            } else {
              res = await axios.get(url, {
                ...config,
                params: payload,
                headers
              });
            }
            if (this.__events.onResponse) this.__events.onResponse(res);
            if (this.__events.onSuccess) return await this.__events.onSuccess(res);
            else return {
              success: true,
              response: res.data
            };
          } catch (error) {
            if (this.__events.onResponse) this.__events.onResponse(error);
            if (this.__events.onError) return await this.__events.onError(error);
            else return {
              success: false,
              status: error ? (error.response ? error.response.status : null) : null,
              code: error.code,
              response: error ? (error.response ? error.response.data : null) : null
            };
          }
        }
      };
  
      if (ob.__events.onCreate) ob.__events.onCreate(ob, __options);
  
      return ob;
    }
  }
};
