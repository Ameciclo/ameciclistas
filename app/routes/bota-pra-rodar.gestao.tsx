import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useAuth } from "~/utils/useAuth";
import { UserCategory, type Bicicleta, type EmprestimoBicicleta } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";
import { getUserPermissions } from "~/utils/authMiddleware";
import { getBicicletas, getEmprestimosBicicletas, getSolicitacoesBicicletas, getUsersFirebase, solicitarEmprestimoBicicleta, aprovarSolicitacaoBicicleta, rejeitarSolicitacaoBicicleta, registrarDevolucaoBicicleta, cadastrarBicicleta, atualizarBicicleta } from "~/api/firebaseConnection.server";
import { BotaPraRodarGestao } from "~/components/BotaPraRodarGestao";
import { BackButton } from "~/components/Forms/Buttons";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const bicicletasData = await getBicicletas();
    const emprestimosData = await getEmprestimosBicicletas();
    const solicitacoesData = await getSolicitacoesBicicletas();
    const usersData = await getUsersFirebase();

    const bicicletas: Bicicleta[] = bicicletasData ? Object.keys(bicicletasData).map(key => ({ firebaseKey: key, ...bicicletasData[key] })) : [];
    const emprestimos: EmprestimoBicicleta[] = emprestimosData ? Object.keys(emprestimosData).map(key => ({ id: key, ...emprestimosData[key] })) : [];
    const solicitacoes = solicitacoesData ? Object.keys(solicitacoesData).map(key => ({ id: key, ...solicitacoesData[key] })) : [];

    const bicicletasComDisponibilidade = bicicletas.map(bicicleta => {
      const emprestimosAtivos = emprestimos.filter((emp: any) =>
        emp.codigo_bicicleta === bicicleta.codigo && emp.status === 'emprestado'
      );

      return {
        ...bicicleta,
        disponivel: emprestimosAtivos.length === 0,
        emprestada: emprestimosAtivos.length > 0
      };
    });

    return json({
      bicicletas: bicicletasComDisponibilidade,
      emprestimos: emprestimos.filter((emp: any) => emp.status === 'emprestado'),
      solicitacoes: solicitacoes.filter((sol: any) => sol.status === 'pendente'),
      users: usersData || {}
    });
  } catch (error) {
    console.error("Erro ao carregar dados do Bota pra Rodar:", error);
    return json({ bicicletas: [], emprestimos: [], solicitacoes: [], users: {} });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;
  const { userPermissions, userId: authUserId } = await getUserPermissions(request);
  const userId = authUserId || undefined;

  try {
    if (action === "aprovar_solicitacao") {
      if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
        return json({ error: "Sem permissão" }, { status: 403 });
      }
      const solicitacaoId = formData.get("solicitacao_id") as string;
      await aprovarSolicitacaoBicicleta(solicitacaoId, userId!, "", false);
      return redirect("/sucesso/bicicleta-aprovada");
    }

    if (action === "rejeitar_solicitacao") {
      if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
        return json({ error: "Sem permissão" }, { status: 403 });
      }
      const solicitacaoId = formData.get("solicitacao_id") as string;
      await rejeitarSolicitacaoBicicleta(solicitacaoId);
      return redirect("/sucesso/bicicleta-rejeitada");
    }

    if (action === "registrar_devolucao") {
      if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
        return json({ error: "Sem permissão" }, { status: 403 });
      }
      const emprestimoId = formData.get("emprestimo_id") as string;
      await registrarDevolucaoBicicleta(emprestimoId);
      return redirect("/sucesso/bicicleta-devolucao");
    }

    if (action === "cadastrar_bicicleta") {
      if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
        return json({ error: "Sem permissão" }, { status: 403 });
      }
      const dadosBicicleta = {
        codigo: formData.get("codigo") as string,
        nome: formData.get("nome") as string,
        tipo: formData.get("tipo") as string,
        categoria: formData.get("categoria") as string || "bicicleta",
        descricao: formData.get("descricao") as string || "",
        disponivel: true
      };
      await cadastrarBicicleta(dadosBicicleta);
      return redirect("/sucesso/bicicleta-cadastro");
    }

    if (action === "atualizar_bicicleta") {
      if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
        return json({ error: "Sem permissão" }, { status: 403 });
      }
      const firebaseKey = formData.get("firebaseKey") as string;
      const dadosAtualizacao = {
        codigo: formData.get("codigo") as string,
        nome: formData.get("nome") as string,
        tipo: formData.get("tipo") as string,
        descricao: formData.get("descricao") as string || ""
      };
      await atualizarBicicleta(firebaseKey, dadosAtualizacao);
      return redirect("/sucesso/bicicleta-atualizada");
    }

    return json({ error: "Ação não reconhecida" }, { status: 400 });
  } catch (error: any) {
    console.error("Erro na ação da gestão do Bota pra Rodar:", error);
    return json({ error: error.message }, { status: 400 });
  }
}

export default function BotaPraRodarGestaoRoute() {
  const { bicicletas, emprestimos, solicitacoes, users } = useLoaderData<typeof loader>();
  const { userPermissions } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <BackButton />
      </div>
      <BotaPraRodarGestao
        emprestimos={emprestimos}
        solicitacoes={solicitacoes}
        bicicletas={bicicletas}
        users={users}
        userPermissions={userPermissions}
      />
    </div>
  );
}
