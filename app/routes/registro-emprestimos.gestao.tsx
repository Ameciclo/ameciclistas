import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useAuth } from "~/utils/useAuth";
import { UserCategory, type ItemInventario, type EmprestimoInventario } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";
import { getUserPermissions } from "~/utils/authMiddleware";
import { getItensInventario, getEmprestimosInventario, getSolicitacoesInventario, getUsersFirebase, aprovarSolicitacaoInventario, rejeitarSolicitacaoInventario, registrarDevolucaoInventario, cadastrarItemInventario, saveProduct } from "~/api/firebaseConnection.server";
import { RegistroEmprestimosGestao } from "~/components/RegistroEmprestimosGestao";
import { BackButton } from "~/components/Forms/Buttons";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const itensData = await getItensInventario();
    const emprestimosData = await getEmprestimosInventario();
    const solicitacoesData = await getSolicitacoesInventario();
    const usersData = await getUsersFirebase();

    const itens: ItemInventario[] = itensData ? Object.keys(itensData).map(key => ({ id: key, ...itensData[key] })) : [];
    const emprestimos: EmprestimoInventario[] = emprestimosData ? Object.keys(emprestimosData).map(key => ({ id: key, ...emprestimosData[key] })) : [];
    const solicitacoes = solicitacoesData ? Object.keys(solicitacoesData).map(key => ({ id: key, ...solicitacoesData[key] })) : [];

    const itensComDisponibilidade = itens.map(item => {
      const emprestimosAtivos = emprestimos.filter((emp: any) =>
        emp.codigo_item === item.codigo && emp.status === 'emprestado'
      );

      return {
        ...item,
        disponivel: emprestimosAtivos.length === 0,
        emprestado: emprestimosAtivos.length > 0
      };
    });

    return json({
      itens: itensComDisponibilidade,
      emprestimos: emprestimos.filter((emp: any) => emp.status === 'emprestado'),
      solicitacoes: solicitacoes.filter((sol: any) => sol.status === 'pendente'),
      users: usersData || {}
    });
  } catch (error) {
    console.error("Erro ao carregar dados do inventário:", error);
    return json({ itens: [], emprestimos: [], solicitacoes: [], users: {} });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;
  const { userPermissions, userId: authUserId } = await getUserPermissions(request);
  const userId = authUserId ? Number(authUserId) : undefined;

  try {
    if (action === "aprovar_solicitacao") {
      if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
        return json({ error: "Sem permissão" }, { status: 403 });
      }
      const solicitacaoId = formData.get("solicitacao_id") as string;
      await aprovarSolicitacaoInventario(solicitacaoId, userId!, "", false);
      return redirect("/sucesso/inventario-aprovado");
    }

    if (action === "rejeitar_solicitacao") {
      if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
        return json({ error: "Sem permissão" }, { status: 403 });
      }
      const solicitacaoId = formData.get("solicitacao_id") as string;
      await rejeitarSolicitacaoInventario(solicitacaoId);
      return redirect("/sucesso/inventario-rejeitado");
    }

    if (action === "registrar_devolucao") {
      if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
        return json({ error: "Sem permissão" }, { status: 403 });
      }
      const emprestimoId = formData.get("emprestimo_id") as string;
      await registrarDevolucaoInventario(emprestimoId);
      return redirect("/sucesso/inventario-devolucao");
    }

    if (action === "cadastrar_item") {
      if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
        return json({ error: "Sem permissão" }, { status: 403 });
      }
      const dadosItem = {
        codigo: formData.get("codigo") as string,
        nome: formData.get("nome") as string,
        categoria: formData.get("categoria") as string,
        subcategoria: formData.get("subcategoria") as string || "",
        detalhamento: formData.get("detalhamento") as string || "",
        descricao: formData.get("descricao") as string || "",
        disponivel: true
      };

      await cadastrarItemInventario(dadosItem);

      const cadastrarAluguel = formData.get("cadastrar_aluguel") === "true";
      if (cadastrarAluguel) {
        const precoAluguel = parseFloat(formData.get("preco_aluguel") as string);
        const produtoAluguel = {
          name: dadosItem.nome,
          category: "ALUGUEL" as any,
          price: precoAluguel,
          stock: 999999,
          description: dadosItem.descricao
        };
        await saveProduct(produtoAluguel);
      }

      return json({ success: cadastrarAluguel ? "Item cadastrado no inventário e como aluguel!" : "Item cadastrado com sucesso!" });
    }

    return json({ error: "Ação não reconhecida" }, { status: 400 });
  } catch (error: any) {
    console.error("Erro na ação da gestão de empréstimos:", error);
    return json({ error: error.message }, { status: 400 });
  }
}

export default function RegistroEmprestimosGestaoRoute() {
  const { itens, emprestimos, solicitacoes, users } = useLoaderData<typeof loader>();
  const { userPermissions } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <BackButton />
      </div>
      <RegistroEmprestimosGestao
        emprestimos={emprestimos}
        solicitacoes={solicitacoes}
        itens={itens}
        users={users}
        userPermissions={userPermissions}
      />
    </div>
  );
}
