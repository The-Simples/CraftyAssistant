interface Env {
  // Add KV namespaces, Durable Object bindings, secrets, etc. here
  // KV_NAMESPACE: KVNamespace;
  // DURABLE_OBJECT: DurableObjectNamespace;
  // SECRET: string;
  CHECK_CONF: KVNamespace
  NMS_INDEX: D1Database
  NMS_QUERY: KVNamespace
  CURSEFORGE: string
}
