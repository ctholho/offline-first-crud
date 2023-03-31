import type { DehydratedState, VueQueryPluginOptions } from "@tanstack/vue-query";
import { VueQueryPlugin, QueryClient, hydrate, dehydrate } from "@tanstack/vue-query";
import { persistQueryClient } from '@tanstack/query-persist-client-core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QryoPlugin } from '@akronym/qryo'
import { get, set, del } from "idb-keyval";
import { PersistedClient, Persister } from "@tanstack/query-persist-client-core";


export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>("vue-query");

  const directus = { url: 'https://8055-ctholho-offlinefirstcru-bfpofmwby7b.ws-eu93.gitpod.io' }

  // Modify your Vue Query global settings here
  const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
          cacheTime: 1000 * 60 * 60 * 24,
          staleTime: 1000 * 60 * 60 * 24,
        },
      },
  })

  /**
   * Creates an Indexed DB persister
   * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
   */
  function createIDBPersister(idbValidKey: IDBValidKey = "qryo") {
    return {
      persistClient: async (client: PersistedClient) => {
        set(idbValidKey, client);
      },
      restoreClient: async () => {
        return await get<PersistedClient>(idbValidKey);
      },
      removeClient: async () => {
        await del(idbValidKey);
      },
    } as Persister;
  }

  const clientPersister = (queryClient: QueryClient) => {
    return persistQueryClient({
      queryClient,
      // persister: createSyncStoragePersister({ storage: localStorage }),
      persister: createIDBPersister()
    })
  }


  const options: VueQueryPluginOptions = { queryClient, clientPersister }

  nuxt.vueApp.use(VueQueryPlugin, options)
  nuxt.vueApp.use(QryoPlugin, directus)

  if (process.server) {
    nuxt.hooks.hook("app:rendered", () => {
      vueQueryState.value = dehydrate(queryClient);
    });
  }

  if (process.client) {
    nuxt.hooks.hook("app:created", () => {
      hydrate(queryClient, vueQueryState.value);
    });
  }
})
