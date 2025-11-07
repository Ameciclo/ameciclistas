import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { verifyMagicToken } from "~/api/magicLink.server";
import { validateEmailAndGetUser, createWebSession } from "~/api/webAuth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  if (!token) {
    return redirect('/login?error=token-missing');
  }
  
  const { email, valid } = verifyMagicToken(token);
  
  if (!valid) {
    return redirect('/login?error=token-invalid');
  }
  
  // Validar email e obter dados do usuário
  const user = await validateEmailAndGetUser(email);
  
  // Criar sessão web
  const sessionCookie = await createWebSession(request, user);
  
  // Redirecionar para home com cookie de sessão
  return redirect('/', {
    headers: {
      'Set-Cookie': sessionCookie,
    },
  });
}

export default function AuthVerify() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Verificando acesso...</h2>
        <p className="text-gray-600">Aguarde um momento.</p>
      </div>
    </div>
  );
}