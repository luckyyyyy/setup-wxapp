/**
 * This file is part of the Muggle.
 * @copyright Copyright (c) 2018 Hangzhou Muggle Network Technology Co., Ltd.
 * @author William Chan <root@williamchan.me>
 */

import wepy from 'wepy';
import { clearAuthorization, getAuthorization, setAuthorization } from '@/utils/authorization';

/**
 * 微信 request 基类
 * 其实 wepy 只是封装了一下 request 改成了 Promise 的形式，每次放行5个。
 *
 * @author William Chan <root@williamchan.me>
 */
class Http {
    /**
     * @var {string} baseUrl
     */
    baseUrl = '';

    /**
     * @var {int} requestCount
     */
    requestCount = 0;

    /**
     * @var {int} timer
     */
    timer = 0;

    /**
     * 构造函数
     * @param {string} baseUrl
     */
    constructor(data) {
        Object.assign(this, data);
    }

    /**
     * 打开加载loading
     */
    openIndicator = () => {
        if (!this.timer) {
            this.timer = setTimeout(() => {
                wepy.showLoading({ title: '数据加载中', mask: true })
            }, 300);
        }
    };

    /**
     * 关闭加载loading
     */
    closeIndicator = () => {
        this.requestCount -= 1;
        if (this.requestCount <= 0) {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = 0;
            }
            wepy.hideLoading();
        }
    };
    /**
     * 发起一个请求
     * @param {string} method OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
     * @param {string} api api地址
     * @param {object|string|ArrayBuffer} data 数据
     * @param {object} params
     */
    request(method, api, data, params = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                let request = {
                    url: `${this.baseUrl}/${api}`,
                    data,
                    method,
                    dataType: params.dataType || 'json',
                    header: {},
                    __params: params,
                    // responseType
                };
                if (typeof this._interceptors.onRequest === 'function') {
                    Object.assign(request, await this._interceptors.onRequest(request));
                }
                this.openIndicator();
                let res = await wepy.request(request);
                this.closeIndicator();
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    if (typeof this._interceptors.onResponse === 'function') {
                        res = this._interceptors.onResponse(res);
                    }
                    return resolve(res);
                } else {
                    if (typeof this._interceptors.onResponseError === 'function') {
                        res = this._interceptors.onResponseError(res);
                    }
                    return reject(res);
                }
            } catch (e) {
                this.closeIndicator();
                let res = e;
                if (typeof this._interceptors.onRequestError === 'function') {
                    res = this._interceptors.onRequestError(res);
                }
                return reject(res);
            }
        });
    }

    /**
     * 发起一个get请求
     * @see request
     */
    get(...args) {
        return this.request('GET', ...args);
    }

    /**
     * 发起一个post请求
     * @see request
     */
    post(...args) {
        return this.request('POST', ...args);
    }

    /**
     * 发起一个put请求
     * @see request
     */
    put(...args) {
        return this.request('PUT', ...args);
    }

    /**
     * 发起一个delete请求
     * @see request
     */
    delete(...args) {
        return this.request('DELETE', ...args);
    }

    /**
     * 发起一个head请求
     * @see request
     */
    head(...args) {
        return this.request('HEAD', ...args);
    }

    /**
     * 发起一个options请求
     * @see request
     */
    options(...args) {
        return this.request('OPTIONS', ...args);
    }

    /**
     * @var {object} _interceptors 拦截器
     * onRequest, onRequestError
     * onResponse, onResponseError
     */
    _interceptors = {}

    /**
     * 设置拦截器
     */
    set interceptors(value) {
        this._interceptors = value;
    }
}

/**
 * @var {string} api基址
 */
export const BASE_URL = 'https://api.chaping.tv/api';

/**
 * @var {object} interceptors
 */
const interceptors = {
    onRequest(req) {
        return new Promise(async (resolve, reject) => {
            let token = getAuthorization();
            if (req.__params.ignoreToken !== true) {
                if (!token) {
                    await getUserInfo();
                    token = getAuthorization();
                }
            }
            if (token) {
                req.header.Authorization = `Bearer ${token}`;
            }
            resolve(req);
        })
    },
    onRequestError(err) {
        wepy.showModal({
            title: '请求失败',
            content: '网络请求失败，请尝试重新打开小程序。',
            showCancel: false,
        })
        return err;
    },
    onResponse(res) {
        return res.data;
    },
    onResponseError(res) {
        if (typeof res.data === 'object' && res.data.errcode) {
            if (res.data.errcode === 401) {
                clearAuthorization();
                // 这里可能需要更好的方案
                const currentPages = getCurrentPages();
                if (currentPages.length > 0) {
                    const load = currentPages[currentPages.length - 1].onLoad;
                    if (load) {
                        load();
                    }
                }
            } else if (res.data.errcode >= 500) {
                wepy.showModal({
                    title: '服务器错误',
                    content: '服务器出错啦，工程师正在加紧修复中。',
                    showCancel: false,
                })
            } else {
                wepy.showModal({
                    title: '操作失败 #404',
                    content: res.data.errmsg,
                    showCancel: false,
                })
            }
        } else {
            wepy.showModal({
                title: '请求失败',
                content: res.data,
                showCancel: false,
            })
        }
        return res;
    }
}

/**
 * @var {Http} 接口封装类
 */
export const http = new Http({ baseUrl: BASE_URL, interceptors });

/**
 * 获取用户授权 assert
 * @return {Promise}
 */
let _getUserInfo = null;
export const getUserInfo = () => {
    if (!_getUserInfo) {
        _getUserInfo = new Promise(async (resolve, reject) => {
            while (!getAuthorization()) {
                try {
                    const data = await wepy.login();
                    const set = await wepy.getSetting();
                    if (set.authSetting['scope.userInfo'] === false) {
                        throw 'scope userInfo disabled';
                    }
                    const user = await wepy.getUserInfo({
                        withCredentials: true,
                        lang: 'zh_CN',
                    });
                    const res = await getToken(data.code, user.iv, user.encryptedData);
                    await setAuthorization(res.data.access_token);
                    _getUserInfo = null;
                    resolve();
                } catch (e) {
                    const set = await wepy.getSetting();
                    if (set.authSetting['scope.userInfo'] === false) {
                        await wepy.showModal({
                            title: '需要授权',
                            content: '请允许授权用户基础信息',
                            showCancel: false,
                        })
                        await wepy.openSetting();
                    }
                    // @todo 换 token 的时候出现了错误需要处理
                }
            };
        });
    }
    return _getUserInfo;
}

/**
 * 换取token
 * @param {string} code wx.login 返回的授权码
 * @param {string} iv 由 wx.getUserInfo({withCredentials:true}) 返回
 * @param {string} encryptedData 加密后的敏感数据，同上
 * @return {Promise}
 */
export const getToken = (code, iv, encryptedData) => {
    return http.post('user/token', {
        wxapp: {
            scenario: 'cpwxapp',
            code,
            iv,
            encryptedData
        }
    }, { ignoreToken: true });
}
