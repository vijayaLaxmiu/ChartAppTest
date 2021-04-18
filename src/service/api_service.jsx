import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import _ from './../utils/loadsh';
import { api_urls } from './api_urls';
import appConfig from '../config/app_config';
// import { Login } from '../router/page_constants';
import { loader } from './loader';

class APIService {
    axiosNoInterceptor = AxiosInstance;
    api_urls = api_urls;
    axiosOptions = AxiosRequestConfig = {
        timeout: 300000,
        //transformRequest: [this.transformRequest],
        withCredentials: true
    };
    ContentHeaders = {
        Json: 'application/json',
        FormData: 'multipart/form-data',
        Plain: 'text/plain'
    };

    BaseDomain = {
        BASE: undefined
    };

    isNotificationCall = false;

    constructor() {
        this.axiosNoInterceptor = axios.create();

        axios.interceptors.response.use((response) => {
            if (!this.isNotificationCall) {
                loader.hide();
            } else {
                this.isNotificationCall = false;
            }

            if (response.status === 401) {
                if ((localStorage.getItem('url')).indexOf('guest-register') === -1) {
                    let url = localStorage.getItem('url');
                    // localStorage.clear();
                    for (let key in localStorage) {
                        if (localStorage.hasOwnProperty(key)) {
                            if (key.indexOf('upshot') !== 0) {
                                localStorage.removeItem(key);
                            }
                        }
                    }
                    localStorage.setItem('url', url);
                    let baseDomain = window.location.href.indexOf('/');
                    window.location.href = window.location.href.substr(0, baseDomain);
                    return response;
                }
            }
            if (response.status > 300) {
                utility.alert({ message: response.message });
            }

            return response;
        }, (error) => {
            if (error.response) {
                loader.hide();
                if (error.response.status === 401) {

                    if ((localStorage.getItem('url')).indexOf('guest-register') === -1) {
                        let url = localStorage.getItem('url');
                        // localStorage.clear();
                        for (let key in localStorage) {
                            if (localStorage.hasOwnProperty(key)) {
                                if (key.indexOf('upshot') !== 0) {
                                    localStorage.removeItem(key);
                                }
                            }
                        }
                        localStorage.setItem('url', url);
                        if (window.location.pathname !== '/login') {
                            window.location.reload();
                        }
                        return error.response;
                    }
                }
                if (error.response.status === 409 || error.response.status === 404 || error.response.status === 401 || error.response.status === 400) {
                    if (error.response && error.response.data && error.response.data.message) {
                        if (error.response.status === 400 && window.location.pathname.includes('/create-album/') && error.response.data.message.includes('Album not found.')) {
                            informationalert.confirmBox(error.response.data.message, () => {
                                window.location.href = '/albums';
                            });
                        } else {
                            informationalert.show(error.response.data.message);
                        }
                    }
                    loader.hide();
                    return error.response;
                }
                if (error.response.status === 500) {
                    informationalert.show('Something went wrong. Please try again later.');
                    loader.hide();
                    return error.response;
                }
            }
            return this.responsePromise(error);
        });

        this.axiosNoInterceptor.interceptors.response.use((response) => {

            return response;
        }, (error) => {
            if (error.response.status === 400) {
                return new Promise((resolve, reject) => {
                    if (error.response) {
                        reject(error.response.data);
                    } else {
                        reject(error);
                    }
                });
            }
            return this.responsePromise(error);
        });

    }

    responsePromise(res) {
        return new Promise((resolve, reject) => {
            if (res.response) {
                resolve(res);
            } else {
                reject(res);
            }
        });
    }

    getHeadersByType(requestMethod, headerType, domain, customHeaders, payload) {
        let data = {};
        switch (headerType) {
            case this.ContentHeaders.Json: {
                data['Content-Type'] = 'application/json';
                break;
            }
            case this.ContentHeaders.Plain: {
                data['Content-Type'] = 'text/plain';
                break;
            }
            case this.ContentHeaders.FormData: {
                data['Content-Type'] = 'multipart/form-data';
                break;
            }
            default:
                data['Content-Type'] = 'application/json';
                break;
        }
        switch (navigator.language) {
            case 'en': {
                data['Accept-Language'] = 'en';
                break;
            }
            case 'it-IT': case 'it': {
                data['Accept-Language'] = 'it';
                break;
            }
            case 'fr-FR': case 'fr': {
                data['Accept-Language'] = 'fr';
                break;
            }
            case 'de-DE': case 'de': {
                data['Accept-Language'] = 'de';
                break;
            }
            case 'nl-NL': case 'nl': {
                data['Accept-Language'] = 'nl';
                break;
            }
            case 'es-ES': case 'es': {
                data['Accept-Language'] = 'es';
                break;
            }
            default:
                data['Accept-Language'] = 'en';
                break;
        }
        let isAuthServer = domain.indexOf('9100') > -1;
        data['Authorization'] = appConfig.AuthInfo && appConfig.AuthInfo.Token ? 'Bearer ' + appConfig.AuthInfo.Token : '';
        if (!isAuthServer && (requestMethod === 'get' || requestMethod === 'put' || requestMethod === 'post' || requestMethod === 'delete')) {

            let signature = data['Authorization'] + process.env.SIGNATURE_SECRET_KEY;
            if (payload && payload.attributes) {
                signature += JSON.stringify({ attributes: payload.attributes });
            }


        }
        if (!isAuthServer) {
            data['os_type'] = navigator.userAgent.indexOf('Linux') !== -1 ? 'Linux' : navigator.userAgent.indexOf('Mac') !== -1 ? 'Mac' : 'Windows';
            data['app_version'] = process.env.app_version;
        }
        data = _.extend({}, data, customHeaders);
        return data;
    }

    notificationGet = (
        data = {
            endPoint: '',
            domain: '',
            payLoad: '',
            id: '',
            headerType: '',
            customHeaders: '',
            showLoader: boolean,
            noHeadersRequired: boolean
        }) => {
        this.isNotificationCall = true;
        if (!data.domain) {
            data.domain = this.BaseDomain.BASE;
        }
        if (!data.headerType) {
            data.headerType = this.ContentHeaders.Json;
        }

        try {
            return axios.get(data.endPoint, {
                baseURL: data.domain,
                timeout: this.axiosOptions.timeout,
                params: data.payLoad,
                headers: data.noHeadersRequired ? null : this.getHeadersByType('get', data.headerType, data.domain, data.customHeaders)
            });
        } catch (e) {
            console.error('axios get::', e);
        }
    }

    post = (data = {
        endPoint: '',
        payLoad: '',
        domain: '',
        headerType: '',
        customHeaders: '',
        showLoader: boolean,
        useNonInterceptor: boolean
    }) => {
        if (!data.domain) {
            data.domain = this.BaseDomain.BASE;
        }
        if (!data.headerType) {
            data.headerType = this.ContentHeaders.Json;
        }

        if (data.showLoader !== false) {
            data.showLoader = true;
        }

        // if (data.headerType === this.ContentHeaders.Json) {
        //     data.payLoad = JSON.stringify(data.payLoad);
        // }
        // if (!navigator.onLine) {

        // }

        if (!data.useNonInterceptor) {
            data.useNonInterceptor = false;
        }

        if (data.showLoader) {
            loader.show();
        }
        if (data.useNonInterceptor) {
            let payLoadData = data.payLoad instanceof FormData ? data.payLoad : JSON.stringify(data.payLoad);
            return this.axiosNoInterceptor.post(data.endPoint,
                payLoadData, {
                timeout: this.axiosOptions.timeout,
                transformRequest: this.axiosOptions.transformRequest,
                baseURL: data.domain,
                headers: this.getHeadersByType(data.headerType, data.domain, data.customHeaders)
            });

        } else {
            let payLoadData = data.payLoad instanceof FormData ? data.payLoad : JSON.stringify(data.payLoad);
            return axios.post(data.endPoint,
                payLoadData, {
                timeout: this.axiosOptions.timeout,
                transformRequest: this.axiosOptions.transformRequest,
                baseURL: data.domain,
                headers: this.getHeadersByType('post', data.headerType, data.domain, data.customHeaders, data.payLoad)
            });

        }
    }

    isNetworkError = (error) => {
        return !error.response && error.code !== 'ECONNABORTED';
    }

    retry = (config = AxiosRequestConfig) => {
        return axios(config);
    }
    put = (data = {
        endPoint: '',
        payLoad: '',
        domain: '',
        id: '',
        headerType: '',
        customHeaders: '',
        showLoader: boolean
    }) => {

        if (!data.domain) {
            data.domain = this.BaseDomain.BASE;
        }
        if (!data.headerType) {
            data.headerType = this.ContentHeaders.Json;
        }
        // if (data.headerType === this.ContentHeaders.Json) {
        //     data.payLoad = JSON.stringify(data.payLoad);
        // }
        if (data.showLoader !== false) {
            data.showLoader = true;
        }

        if (data.showLoader) {
            loader.show();
        }
        let payLoadData = data.payLoad instanceof FormData ? data.payLoad : JSON.stringify(data.payLoad);
        return axios.put(data.endPoint,
            payLoadData, {
            timeout: this.axiosOptions.timeout,
            transformRequest: this.axiosOptions.transformRequest,
            baseURL: data.domain,
            headers: this.getHeadersByType('put', data.headerType, data.domain, data.customHeaders, data.payLoad)
        });
    }

    delete = (data = {
        endPoint: '',
        payLoad: '',
        domain: '',
        id: '',
        headerType: '',
        customHeaders: '',
        showLoader: boolean
    }) => {

        if (!data.domain) {
            data.domain = this.BaseDomain.BASE;
        }
        if (!data.headerType) {
            data.headerType = this.ContentHeaders.Json;
        }

        if (data.showLoader !== false) {
            data.showLoader = true;
        }

        if (data.showLoader) {
            loader.show();
        }

        return axios.delete(data.endPoint, {
            baseURL: data.domain,
            headers: this.getHeadersByType('delete', data.headerType, data.domain, data.customHeaders)
        });
    }

    get = (data = {
        endPoint: '',
        payLoad: '',
        domain: '',
        id: '',
        headerType: '',
        customHeaders: '',
        showLoader: boolean,
        noHeadersRequired: boolean
    }) => {
        if (!data.domain) {
            data.domain = this.BaseDomain.BASE;
        }
        if (!data.headerType) {
            data.headerType = this.ContentHeaders.Json;
        }
        if (data.showLoader || data.showLoader === undefined) {
            data.showLoader = true;
        }
        if (data.showLoader) {
            loader.show();
        }
        try {
            return axios.get(data.endPoint, {
                baseURL: data.domain,
                timeout: this.axiosOptions.timeout,
                params: data.payLoad,
                headers: data.noHeadersRequired ? null : this.getHeadersByType('get', data.headerType, data.domain, data.customHeaders)
            });
        } catch (e) {
            console.error('axios get::', e);
        }
    }

    getFileData = (data = {
        endPoint: '',
        domain: '',
        payLoad: '',
        id: '',
        headerType: '',
        customHeaders: '',
        showLoader: boolean,
        noHeadersRequired: boolean
    }) => {
        if (!data.domain) {
            data.domain = this.BaseDomain.BASE;
        }
        if (!data.headerType) {
            data.headerType = this.ContentHeaders.Json;
        }
        if (data.showLoader || data.showLoader === undefined) {
            data.showLoader = true;
        }
        if (data.showLoader) {
            loader.show();
        }

        try {
            return axios.get(data.endPoint, {
                baseURL: data.domain,
                timeout: this.axiosOptions.timeout,
                params: data.payLoad,
                headers: data.noHeadersRequired ? null : this.getHeadersByType('get', data.headerType, data.domain, data.customHeaders)
            });
        } catch (e) {
            console.error('axios get::', e);
        }
    }

}

export const api_service = new APIService();
