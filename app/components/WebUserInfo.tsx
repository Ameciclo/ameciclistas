import { Form } from "@remix-run/react";
import type { WebUser } from "~/api/webAuth.server";

interface WebUserInfoProps {
  webUser: WebUser;
}

export function WebUserInfo({ webUser }: WebUserInfoProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Olá, {webUser.name}!
          </h3>
          <p className="text-sm text-gray-500">
            {webUser.email} • {webUser.category}
          </p>
          {webUser.cpf && (
            <p className="text-xs text-gray-400">
              CPF: {webUser.cpf}
            </p>
          )}
        </div>
        <Form method="post" action="/auth/logout">
          <button
            type="submit"
            className="text-sm text-red-600 hover:text-red-800"
          >
            Sair
          </button>
        </Form>
      </div>
    </div>
  );
}