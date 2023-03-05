import axios from 'axios';

let controller = {
  events: {},
  create(opts, events = {}){
    events = {
      ...this.events,
      ...events
    };

    let ob = {
      opts: {
        headers: {},
        payload: {},
        config: {},
        path: '',
        domain: '',
        method: '',
        keys: {
          auth: '__a',
          view: '__vt'
        },
        ...opts
      },
      events,
    
      makeid(length) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
      },
    
      path(p) {
        this.opts.path = p;
        return this;
      },
    
      domain(d){
        this.opts.domain = d;
        return this;
      },
    
      config(config, repl) {
        if (repl) this.opts.config = config;
        else this.opts.config = {
          ...this.opts.config,
          ...config
        };
    
        return this;
      },
    
      keys(keys){
        this.opts.keys = {
          ...this.opts.keys,
          ...keys
        };
    
        return this;
      },
    
      headers(headers, repl) {
        if (repl) this.opts.headers = headers;
        else this.opts.headers = {
          ...this.opts.headers,
          ...headers
        };
    
        return this;
      },
    
      method(name) {
        this.opts.method = name;
        return this;
      },
    
      payload(payload) {
        this.opts.payload = payload;
        return this;
      },
    
      authorization(token){
        token = token || localStorage.getItem(this.opts.keys.auth);
    
        if (token) {
          this.opts.headers.authorization = token;
        }
    
        return this;
      },
      
      viewid(){
        let viewer = localStorage.getItem(this.opts.keys.view);
    
        if (!viewer) {
          viewer = this.makeid('30');
          localStorage.setItem(this.opts.keys.view, viewer);
        }
    
        this.opts.headers.__vt = viewer;
    
        return this;
      },
    
      async call() {
        try {
          if (this.events.beforeRequest) this.events.beforeRequest(this, this.opts);
          let method = this.opts.method.toUpperCase();
          let { payload, headers, config, path, domain } = this.opts;
          let res;
          let url = `${domain}/${path}`;
    
          if (method === 'POST') {
            res = await axios.post(url, payload, {
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
    
          if (this.events.onSuccess) return await this.events.onSuccess(res);
          else return {
            success: true,
            response: res.data
          };
        } catch (error) {
          if (this.events.onError) return await this.events.onError(error);
          else return {
            success: false,
            status: error ? (error.response ? error.response.status : null) : null,
            code: error.code,
            response: error ? (error.response ? error.response.data : null) : null
          };
        }
      }
    };

    if (ob.events.onCreate) ob.events.onCreate(ob, opts);

    return ob;
  }
};

export default controller;
