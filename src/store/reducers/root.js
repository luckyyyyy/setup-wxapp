/**
 * This file is part of the Muggle.
 * @copyright Copyright (c) 2018 Hangzhou Muggle Network Technology Co., Ltd.
 * @author William Chan <root@williamchan.me>
 */

import { handleActions } from 'redux-actions';
import { TEST } from '@/store/types/root';

export default handleActions({
    [TEST] (state) {
        return {
            ...state,
            num: state.num + 1
        }
    },
}, {
    num: 0,
})
