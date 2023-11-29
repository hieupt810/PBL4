import axios, { AxiosInstance } from "axios";
import { getCookie, hasCookie } from "cookies-next";

class Http {
  instance: AxiosInstance;
  constructor() {
    this.instance = axios.create({
      baseURL: process.env.BACKEND_URL,
      timeout: 5000,
      headers: {
        Authorization: hasCookie("token") ? getCookie("token") : "",
      },
    });
  }
}

const http = new Http().instance;

export default http;
