import browser from 'webextension-polyfill';

import { DAppSession, DAppSessions, Network, NostrRelays } from 'lib/messaging';
import { NETWORKS } from 'lib/temple/networks';

const STORAGE_KEY = 'dapp_sessions';

export async function getAllDApps(): Promise<DAppSessions> {
  const stored = await browser.storage.local.get([STORAGE_KEY]);
  return (stored[STORAGE_KEY] || {}) as DAppSessions;
}

export async function getDApp(origin: string): Promise<DAppSession | undefined> {
  return (await getAllDApps())[origin];
}

export async function setDApp(origin: string, permissions: DAppSession) {
  const current = await getAllDApps();
  const newDApps = { ...current, [origin]: permissions };
  await setDApps(newDApps);
  return newDApps;
}

export async function removeDApp(origin: string) {
  const { [origin]: permissionsToRemove, ...restDApps } = await getAllDApps();
  await setDApps(restDApps);
  return restDApps;
}

export function cleanDApps() {
  return setDApps({});
}

function setDApps(newDApps: DAppSessions) {
  return browser.storage.local.set({ [STORAGE_KEY]: newDApps });
}

export async function getCurrentAccountInfo() {
  const {
    account_publickey: publicKey,
    account_publickey_nostr: publicKeyNostr,
    account_type: type
  } = await browser.storage.local.get(['account_publickey', 'account_publickey_nostr', 'account_type']);
  return {
    publicKeyNostr,
    publicKey,
    type
  };
}

export async function getCurrentNetworkHost() {
  const { network_id: networkId, custom_networks_snapshot: customNetworksSnapshot } = await browser.storage.local.get([
    'network_id',
    'custom_networks_snapshot'
  ]);

  const allNetworks = [...NETWORKS, ...(customNetworksSnapshot ?? [])] as Network[];
  return allNetworks.find(n => !n.disabled && !n.hidden && n.id === networkId) as Network;
}

export async function getNetworkHosts(networkName: string) {
  const { custom_networks_snapshot: customNetworksSnapshot } = await browser.storage.local.get(
    'custom_networks_snapshot'
  );

  const allNetworks = [...NETWORKS, ...(customNetworksSnapshot ?? [])] as Network[];
  return allNetworks.filter(n => !n.disabled && !n.hidden && n.networkName === networkName);
}

export async function getNostrRelays() {
  const { nostr_relays_snapshot } = await browser.storage.local.get('nostr_relays_snapshot');

  return nostr_relays_snapshot as NostrRelays;
}
