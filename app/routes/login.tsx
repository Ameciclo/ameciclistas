import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { sendMagicLink } from "~/api/magicLink.server";
import { getWebUser } from "~/api/webAuth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Se já está logado, redirecionar para home
  const webUser = await getWebUser(request);
  if (webUser) {
    return redirect('/');
  }
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  
  if (!email || !email.includes('@')) {
    return json({ error: 'Email inválido' }, { status: 400 });
  }
  
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  
  const sent = await sendMagicLink(email, baseUrl);
  
  if (!sent) {
    return json({ error: 'Erro ao enviar email. Tente novamente.' }, { status: 500 });
  }
  
  return json({ success: true, email });
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  if (actionData?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img
              className="mx-auto h-12 w-auto"
              src="/images/apenas logo da ameciclo.svg"
              alt="Ameciclo"
            />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Email enviado!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enviamos um link de acesso para <strong>{actionData.email}</strong>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Verifique sua caixa de entrada e spam. O link expira em 24 horas.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="/images/apenas logo da ameciclo.svg"
            alt="Ameciclo"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acesso ao Sistema
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Digite seu email para receber um link de acesso
          </p>
        </div>
        
        <Form method="post" className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Seu email"
              disabled={isSubmitting}
            />
          </div>
          
          {actionData?.error && (
            <div className="text-red-600 text-sm text-center">
              {actionData.error}
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Link de Acesso'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}