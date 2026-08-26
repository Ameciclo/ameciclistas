import { type LoaderFunctionArgs } from "@remix-run/node";
import { getWorkgroupByName } from "~/api/firebaseConnection.server";

const TELEGRAM_FILE_URL_PREFIX = "https://api.telegram.org/file/bot";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const groupName = url.searchParams.get("group");

  if (!groupName) {
    return new Response("Parâmetro 'group' é obrigatório", { status: 400 });
  }

  const group = await getWorkgroupByName(groupName);
  const iconUrl = group?.iconUrl;

  if (!iconUrl || !iconUrl.startsWith(TELEGRAM_FILE_URL_PREFIX)) {
    return new Response("Ícone não encontrado", { status: 404 });
  }

  try {
    const response = await fetch(iconUrl);
    if (!response.ok) {
      return new Response("Ícone não disponível", { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Erro ao buscar ícone do grupo:", error);
    return new Response("Erro ao buscar ícone", { status: 500 });
  }
}
