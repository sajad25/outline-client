/*
  Copyright 2021 The Outline Authors
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import {Ref} from 'lit/directives/ref';
import {Menu} from '@material/mwc-menu';
import {ServerConnectionState} from '../server_connection_indicator';

export enum ServerListItemEvent {
  CONNECT = 'ConnectPressed',
  DISCONNECT = 'DisconnectPressed',
  FORGET = 'ForgetPressed',
  RENAME = 'ShowServerRename',
}

export interface ServerListItem {
  disabled: boolean;
  errorMessageId?: string;
  isOutlineServer: boolean;
  address: string;
  id: string;
  name: string;
  connectionState: ServerConnectionState;
}

/**
 * TODO jsdoc
 */
export interface ServerListItemElement {
  server: ServerListItem;
  rootPath: string;
  localizer: (messageID: string) => string;
  menu: Ref<Menu>;
}