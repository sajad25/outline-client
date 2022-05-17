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

import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-menu';
import '../../server_connection_indicator';

import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {createRef, Ref, ref} from 'lit/directives/ref.js';

import {Menu} from '@material/mwc-menu';

import {ServerListItem, ServerListItemElement, ServerListItemEvent} from '..';
import {ServerConnectionState} from '../../server_connection_indicator';

const sharedCSS = css`
  /* TODO(daniellacosse): reset via postcss */
  h2,
  span,
  footer,
  button,
  div {
    all: initial;
  }

  :host {
    --server-name-size: 1rem;
    --server-address-size: 0.875rem;

    align-items: center;
    background: var(--outline-card-background);
    border-radius: var(--outline-corner);
    box-shadow: var(--outline-elevation);
    display: grid;
    grid-gap: var(--outline-slim-gutter);
    height: 100%;
    min-width: var(--min-supported-device-width);
    overflow: hidden;
    user-select: none;
    width: 100%;
  }

  .card-metadata {
    font-family: var(--outline-font-family);
    color: var(--outline-text-color);
    grid-area: metadata;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .card-metadata-text {
    user-select: text;
    padding: var(--outline-slim-gutter);
  }

  .card-metadata-server-name {
    display: block;
    margin-bottom: var(--outline-mini-gutter);
    color: var(--outline-text-color);
    font-size: var(--server-name-size);
    font-family: var(--outline-font-family);
  }

  .card-metadata-server-address {
    color: var(--outline-label-color);
    font-family: var(--outline-font-family);
    font-size: var(--server-address-size);
  }

  .card-menu {
    align-self: start;
    grid-area: menu;
    position: relative;
  }

  .card-footer {
    align-items: center;
    background: var(--outline-card-footer);
    border-top: var(--outline-hairline);
    box-sizing: border-box;
    display: flex;
    grid-area: footer;
    justify-content: end;
    padding: var(--outline-mini-gutter) var(--outline-gutter);
  }

  .card-error {
    color: var(--outline-error);
    margin: 0 var(--outline-slim-gutter);
  }
`;

const isConnectedState = (connectionState: ServerConnectionState) =>
  [ServerConnectionState.CONNECTING, ServerConnectionState.CONNECTED, ServerConnectionState.RECONNECTING].includes(
    connectionState
  );

const getSharedComponents = ({
  server,
  menu,
  localizer,
  dispatchEvent: dispatcher,
}: ServerListItemElement & LitElement) => {
  const hasErrorMessage = Boolean(server.errorMessageId);

  const messages = {
    serverName:
      server.name ?? localizer(server.isOutlineServer ? 'server-default-name-outline' : 'server-default-name'),
    error: hasErrorMessage && localizer(server.errorMessageId),
    connectButton: localizer(
      isConnectedState(server.connectionState) ? 'disconnect-button-label' : 'connect-button-label'
    ),
  };

  // TODO(daniellacosse): don't rerender dispatchers unnecessarily
  const dispatchers = {
    beginRename: () =>
      dispatcher(
        new CustomEvent(ServerListItemEvent.RENAME, {detail: {serverId: server.id}, bubbles: true, composed: true})
      ),
    forget: () =>
      dispatcher(
        new CustomEvent(ServerListItemEvent.FORGET, {detail: {serverId: server.id}, bubbles: true, composed: true})
      ),
    connectToggle: () =>
      dispatcher(
        new CustomEvent(
          isConnectedState(server.connectionState) ? ServerListItemEvent.DISCONNECT : ServerListItemEvent.CONNECT,
          {detail: {serverId: server.id}, bubbles: true, composed: true}
        )
      ),
  };

  return {
    messages,
    dispatchers,
    elements: {
      metadataText: html`
        <div class="card-metadata-text">
          <h2 class="card-metadata-server-name" id="server-name">
            ${messages.serverName}
          </h2>
          <label class="card-metadata-server-address">${server.address}</label>
        </div>
      `,
      menu: html`
        <div class="card-menu">
          <mwc-icon-button icon="more_vert" @click=${menu.value?.show}></mwc-icon-button>
          <mwc-menu ${ref(menu)}>
            <mwc-list-item @click="${dispatchers.beginRename}">${localizer('server-rename')}</mwc-list-item>
            <mwc-list-item @click="${dispatchers.forget}">${localizer('server-forget')}</mwc-list-item>
          </mwc-menu>
        </div>
      `,
      footer: html`
        <footer class="card-footer">
          <span class="card-error">${messages.error}</span>
          <mwc-button
            label="${messages.connectButton}"
            @click="${dispatchers.connectToggle}"
            ?disabled=${hasErrorMessage}
          >
          </mwc-button>
        </footer>
      `,
    },
  };
};

@customElement('server-row-card')
export class ServerRowCard extends LitElement implements ServerListItemElement {
  @property() server: ServerListItem;

  @property({attribute: 'root-path'}) rootPath: string;
  @property() localizer: (messageID: string) => string;

  menu: Ref<Menu> = createRef();

  static styles = [
    sharedCSS,
    css`
      :host {
        grid-template-columns: 0 1fr auto 0;
        grid-template-rows: 0 minmax(0, 1fr) auto;
        grid-template-areas:
          '. . . .'
          '. metadata menu .'
          'footer footer footer footer';
      }

      server-connection-indicator {
        float: left;
        min-height: calc(var(--server-name-size) + var(--outline-mini-gutter) + var(--server-address-size));
        max-height: calc(
          var(--outline-slim-gutter) + var(--server-name-size) + var(--outline-mini-gutter) + var(--server-address-size) +
            var(--outline-slim-gutter)
        );
      }
    `,
  ];

  render() {
    const {elements} = getSharedComponents(this);

    return html`
      <div class="card-metadata" aria-labelledby="server-name">
        <server-connection-indicator
          connection-state="${this.server.connectionState}"
          root-path="${this.rootPath}"
        ></server-connection-indicator>
        ${elements.metadataText}
      </div>
      ${elements.menu} ${elements.footer}
    `;
  }
}

@customElement('server-hero-card')
export class ServerHeroCard extends LitElement implements ServerListItemElement {
  @property() server: ServerListItem;

  @property({attribute: 'root-path'}) rootPath: string;
  @property() localizer: (messageID: string) => string;

  menu: Ref<Menu> = createRef();

  static styles = [
    sharedCSS,
    css`
      :host {
        grid-template-columns: 0 1fr auto 0;
        grid-template-rows: 0 auto minmax(0, 1fr) auto;
        grid-template-areas:
          '. . . .'
          '. metadata menu .'
          '. button button .'
          'footer footer footer footer';
      }

      .card-connection-button-container {
        grid-area: button;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        height: 100%;
        gap: var(--outline-slim-gutter);
        box-sizing: border-box;
        padding: var(--outline-large-gutter) 0;
      }

      server-connection-indicator {
        cursor: pointer;
        min-height: 192px;
        max-height: calc(var(--min-supported-device-width) - var(--outline-slim-gutter) - var(--outline-slim-gutter));
      }

      .card-connection-label {
        color: var(--outline-label-color);
        font-size: var(--server-address-size);
        font-family: var(--outline-font-family);
      }
    `,
  ];

  render() {
    const {elements, dispatchers, messages} = getSharedComponents(this);

    const connectionStatusText = this.localizer(`${this.server.connectionState}-server-state`);
    const connectToggleKeyboardDispatcher = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (event.key === 'Enter') {
        dispatchers.connectToggle();
      }
    };

    return html`
      <div class="card-metadata" aria-labelledby="server-name">
        ${elements.metadataText}
      </div>
      ${elements.menu}
      <div class="card-connection-button-container">
        <server-connection-indicator
          @click="${!this.server.errorMessageId && dispatchers.connectToggle}"
          @keydown="${connectToggleKeyboardDispatcher}"
          connection-state="${this.server.connectionState}"
          id="${messages.connectButton}"
          role="button"
          tabindex="0"
          root-path="${this.rootPath}"
          title="${connectionStatusText}"
        ></server-connection-indicator>
        <label class="card-connection-label" for="${messages.connectButton}">${connectionStatusText}</label>
      </div>
      ${elements.footer}
    `;
  }
}
