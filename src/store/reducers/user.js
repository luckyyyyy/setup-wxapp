/**
 * This file is part of the Muggle.
 * @copyright Copyright (c) 2018 Hangzhou Muggle Network Technology Co., Ltd.
 * @author William Chan <root@williamchan.me>
 */

import { handleActions, createAction } from 'redux-actions';
import * as TYPE from '@/store/types/user';
import * as api from '@/api/user';

const states = {
    user: {},
    follow: {},
};

export const getUser = createAction(TYPE.GET_USER, () => {
    return api.getUserProfile();
});

export const getFollow = createAction(TYPE.GET_USER_FOLLOW, (scenario) => {
    return api.getFollow(scenario);
});

export default handleActions({
    [TYPE.GET_USER] (state, action) {
        return {
            ...state,
            user: action.payload.data
        }
    },
    [TYPE.GET_USER_FOLLOW] (state, action) {
        return {
            ...state,
            follow: action.payload.data
        }
    },
}, states);
