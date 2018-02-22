/**
 * This file is part of the Muggle.
 * @copyright Copyright (c) 2018 Hangzhou Muggle Network Technology Co., Ltd.
 * @author William Chan <root@williamchan.me>
 */
import wepy from 'wepy';

export const clearAuthorization = () => wepy.removeStorageSync('tokens');
export const getAuthorization = () => wepy.getStorageSync('tokens');
export const setAuthorization = (token) => wepy.setStorageSync('tokens', token);

