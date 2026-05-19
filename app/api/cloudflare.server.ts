export interface CloudflareRedirectItem {
  source_url: string;
  target_url: string;
  status_code: number;
}

interface CloudflareListResult {
  result: { id: string; name: string };
  success: boolean;
  errors: string[];
}

interface CloudflareOperationResult {
  result: { operation_id: string };
  success: boolean;
  errors: string[];
}

interface CloudflareRulesetResult {
  result: { id: string };
  success: boolean;
  errors: string[];
}

function getConfig() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const listName = process.env.CLOUDFLARE_REDIRECT_LIST_NAME || 'ameciclo-links-redirects';
  const domain = process.env.AMECICLO_DOMAIN || 'ameciclo.org';

  if (!accountId || !apiToken) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_API_TOKEN são obrigatórios');
  }

  return { accountId, apiToken, listName, domain };
}

async function findOrCreateList(accountId: string, apiToken: string, listName: string): Promise<string> {
  const listUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/rules/lists`;

  const existingResp = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${apiToken}` },
  });
  const existingData = await existingResp.json() as { result?: { id: string; name: string }[]; success: boolean; errors: string[] };
  if (!existingData.success) {
    throw new Error(`Erro ao buscar listas: ${JSON.stringify(existingData.errors)}`);
  }
  const existing = existingData.result?.find(l => l.name === listName);
  if (existing) return existing.id;

  const createResp = await fetch(listUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: listName,
      description: 'Redirects for Ameciclo links',
      kind: 'redirect',
    }),
  });
  const createData = await createResp.json() as CloudflareListResult;
  if (!createData.success) {
    throw new Error(`Erro ao criar lista: ${JSON.stringify(createData.errors)}`);
  }
  return createData.result.id;
}

async function waitForOperation(accountId: string, apiToken: string, operationId: string, maxRetries = 15): Promise<void> {
  const statusUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/rules/lists/bulk_operations/${operationId}`;

  for (let i = 0; i < maxRetries; i++) {
    const resp = await fetch(statusUrl, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    const data = await resp.json() as { result?: { status: string }; success: boolean; errors: string[] };

    if (!data.success) {
      throw new Error(`Erro ao verificar operação: ${JSON.stringify(data.errors)}`);
    }

    if (data.result?.status === 'completed') return;
    if (data.result?.status === 'failed') {
      throw new Error('Operação de atualização da lista falhou no Cloudflare');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Timeout ao esperar operação do Cloudflare');
}

export async function syncRedirectsToCloudflare(redirects: { source_url: string; target_url: string; status_code: number }[]) {
  const { accountId, apiToken, listName } = getConfig();

  const listId = await findOrCreateList(accountId, apiToken, listName);

  // PUT replace all items (vs POST which would append)
  const itemsUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/rules/lists/${listId}/items`;
  const itemsResp = await fetch(itemsUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(redirects.map(r => ({ redirect: r }))),
  });
  const itemsData = await itemsResp.json() as CloudflareOperationResult;
  if (!itemsData.success) {
    throw new Error(`Erro ao atualizar items da lista: ${JSON.stringify(itemsData.errors)}`);
  }

  await waitForOperation(accountId, apiToken, itemsData.result.operation_id);

  return { success: true, operationId: itemsData.result.operation_id };
}

export async function findOrCreateRedirectRuleset(redirectListName: string) {
  const { accountId, apiToken } = getConfig();

  const rulesetsUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/rulesets`;
  const rulesetsResp = await fetch(rulesetsUrl, {
    headers: { Authorization: `Bearer ${apiToken}` },
  });
  const rulesetsData = await rulesetsResp.json() as { result?: { id: string; name: string; phase: string }[]; success: boolean; errors: string[] };

  if (!rulesetsData.success) {
    throw new Error(`Erro ao buscar rulesets: ${JSON.stringify(rulesetsData.errors)}`);
  }

  const existingRuleset = rulesetsData.result?.find(
    r => r.phase === 'http_request_redirect'
  );

  const rule = {
    ref: 'eval_ameciclo_redirects',
    expression: `http.request.full_uri in $${redirectListName}`,
    description: 'Bulk Redirect rule for Ameciclo links',
    action: 'redirect' as const,
    action_parameters: {
      from_list: {
        name: redirectListName,
        key: 'http.request.full_uri',
      },
    },
  };

  if (existingRuleset) {
    const updateResp = await fetch(`${rulesetsUrl}/${existingRuleset.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: existingRuleset.name,
        kind: 'root',
        phase: 'http_request_redirect',
        rules: [rule],
      }),
    });
    const updateData = await updateResp.json() as { success: boolean; errors: string[] };
    if (!updateData.success) {
      throw new Error(`Erro ao atualizar ruleset: ${JSON.stringify(updateData.errors)}`);
    }
    return existingRuleset.id;
  }

  const createResp = await fetch(rulesetsUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Ameciclo Redirects',
      kind: 'root',
      phase: 'http_request_redirect',
      rules: [rule],
    }),
  });
  const createData = await createResp.json() as CloudflareRulesetResult;
  if (!createData.success) {
    throw new Error(`Erro ao criar ruleset: ${JSON.stringify(createData.errors)}`);
  }
  return createData.result.id;
}

export async function fetchRedirectList(): Promise<{ source_url: string; target_url: string; status_code: number }[]> {
  const { accountId, apiToken, listName } = getConfig();

  const listUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/rules/lists`;
  const listsResp = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${apiToken}` },
  });
  const listsData = await listsResp.json() as { result?: { id: string; name: string }[]; success: boolean; errors: string[] };
  if (!listsData.success) {
    throw new Error(`Erro ao buscar listas: ${JSON.stringify(listsData.errors)}`);
  }

  const list = listsData.result?.find(l => l.name === listName);
  if (!list) return [];

  const itemsUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/rules/lists/${list.id}/items`;
  const itemsResp = await fetch(itemsUrl, {
    headers: { Authorization: `Bearer ${apiToken}` },
  });
  const itemsData = await itemsResp.json() as {
    result?: { redirect: { source_url: string; target_url: string; status_code: number } }[];
    success: boolean;
    errors: string[];
  };
  if (!itemsData.success) {
    throw new Error(`Erro ao buscar items da lista: ${JSON.stringify(itemsData.errors)}`);
  }

  return (itemsData.result || []).map(item => item.redirect);
}

export function generateRedirectCsv(redirects: { source_url: string; target_url: string; status_code: number }[]): string {
  const header = 'source_url,target_url,status_code';
  const rows = redirects.map(r => `"${r.source_url}","${r.target_url}",${r.status_code}`);
  return [header, ...rows].join('\n');
}

export function generateRedirectJson(redirects: { source_url: string; target_url: string; status_code: number }[]) {
  return redirects.map(r => ({
    redirect: {
      source_url: r.source_url,
      target_url: r.target_url,
      status_code: r.status_code,
    },
  }));
}
