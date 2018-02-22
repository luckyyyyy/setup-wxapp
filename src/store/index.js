/**
 * This file is part of the Muggle.
 * @copyright Copyright (c) 2018 Hangzhou Muggle Network Technology Co., Ltd.
 * @author William Chan <root@williamchan.me>
 */

import { createStore, applyMiddleware, combineReducers } from 'redux';
import promiseMiddleware from 'redux-promise';
import reducers from '@/store/reducers';

/**
 * @return {store}
 */
export default function initStore() {
    return createStore(reducers, applyMiddleware(promiseMiddleware));
}
