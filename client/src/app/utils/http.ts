import axios, { AxiosInstance } from "axios";

class Http {
  instance: AxiosInstance;
  constructor() {
    this.instance = axios.create({
      baseURL: "http://127.0.0.1:8082/",
      timeout: 10000,
    });
  }
}

const http = new Http().instance;

export default http;
