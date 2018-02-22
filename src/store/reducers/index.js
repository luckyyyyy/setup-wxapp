/**
 * This file is part of the Muggle.
 * @copyright Copyright (c) 2018 Hangzhou Muggle Network Technology Co., Ltd.
 * @author William Chan <root@williamchan.me>
 */

import { combineReducers } from 'redux';
import root from './root';
import user from './user';

export default combineReducers({
    user,
    root,
})
