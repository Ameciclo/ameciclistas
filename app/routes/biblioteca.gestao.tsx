import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useAuth } from "~/utils/useAuth";
import { UserCategory } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";
import { getUserPermissions } from "~/utils/authMiddleware";
import db from "~/api/firebaseAdmin.server.js";
import { getBiblioteca, getEmprestimos, getSolicitacoes, getUsersFirebase } from "~/api/firebaseConnection.server";
import type { Livro, Emprestimo } from "~/utils/types";
import { BibliotecaGestao } from "~/components/BibliotecaGestao";
import { BackButton } from "~/components/Forms/Buttons";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const bibliotecaData = await getBiblioteca();
    const emprestimosData = await getEmprestimos();
    const solicitacoesData = await getSolicitacoes();
    const usersData = await getUsersFirebase();

    const biblioteca: Livro[] = bibliotecaData ? Object.keys(bibliotecaData).map(key => ({ firebaseKey: key, ...bibliotecaData[key] })) : [];
    const emprestimos: Emprestimo[] = emprestimosData ? Object.keys(emprestimosData).map(key => ({
      ...emprestimosData[key],
      id: key
    })) : [];
    const solicitacoes = solicitacoesData ? Object.keys(solicitacoesData).map(key => ({ id: key, ...solicitacoesData[key] })) : [];

    const livrosAgrupados: { [key: string]: any } = {};

    biblioteca.forEach(livro => {
      const titulo = livro.title;

      if (!livrosAgrupados[titulo]) {
        livrosAgrupados[titulo] = {
          ...livro,
          firebaseKey: livro.firebaseKey,
          titulo: livro.title,
          autor: livro.author,
          codigo: livro.register,
          ano: livro.year,
          tipo: livro.type,
          exemplares: []
        };
      }

      const emprestimosDoExemplar = emprestimos.filter((emp: any) =>
        emp.subcodigo === livro.register && emp.status === 'emprestado'
      );

      const emprestado = emprestimosDoExemplar.length > 0;
      const isConsultaLocal = livro.register.endsWith('.1');

      livrosAgrupados[titulo].exemplares.push({
        subcodigo: livro.register,
        disponivel: !emprestado && !isConsultaLocal,
        consulta_local: isConsultaLocal,
        emprestado: emprestado
      });
    });

    const livrosComDisponibilidade = Object.values(livrosAgrupados);

    return json({
      livros: livrosComDisponibilidade,
      emprestimos: emprestimos.filter((emp: any) => emp.status === 'emprestado'),
      solicitacoes: solicitacoes.filter((sol: any) => sol.status === 'pendente'),
      users: usersData || {}
    });
  } catch (error) {
    console.error("Erro ao carregar dados da biblioteca:", error);
    return json({ livros: [], emprestimos: [], solicitacoes: [], users: {} });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;
  const { userPermissions } = await getUserPermissions(request);

  try {
    if (action === "aprovar_solicitacao") {
      if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
        return json({ success: false, error: "Sem permissão" }, { status: 403 });
      }
      const solicitacao_id = formData.get("solicitacao_id") as string;

      const solicitacaoRef = db.ref(`biblioteca_solicitacoes/${solicitacao_id}`);
      await solicitacaoRef.update({ status: 'aprovada', updated_at: new Date().toISOString() });

      const solicitacaoSnapshot = await solicitacaoRef.once("value");
      const solicitacao = solicitacaoSnapshot.val();

      if (solicitacao) {
        const emprestimoRef = db.ref("loan_record");
        await emprestimoRef.push({
          usuario_id: solicitacao.usuario_id,
          subcodigo: solicitacao.subcodigo,
          data_saida: new Date().toISOString().split('T')[0],
          status: 'emprestado',
          created_at: new Date().toISOString()
        });
      }

      return redirect("/sucesso/biblioteca-aprovada");
    }

    if (action === "rejeitar_solicitacao") {
      if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
        return json({ success: false, error: "Sem permissão" }, { status: 403 });
      }
      const solicitacao_id = formData.get("solicitacao_id") as string;
      const solicitacaoRef = db.ref(`biblioteca_solicitacoes/${solicitacao_id}`);
      await solicitacaoRef.update({ status: 'rejeitada', updated_at: new Date().toISOString() });
      return redirect("/sucesso/biblioteca-rejeitada");
    }

    if (action === "registrar_devolucao") {
      if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
        return json({ success: false, error: "Sem permissão" }, { status: 403 });
      }
      const emprestimo_id = formData.get("emprestimo_id") as string;
      const emprestimoRef = db.ref(`loan_record/${emprestimo_id}`);
      const snapshot = await emprestimoRef.once("value");
      const emprestimo = snapshot.val();

      if (!emprestimo) {
        return json({ success: false, error: "Empréstimo não encontrado" });
      }

      await emprestimoRef.update({
        status: 'devolvido',
        data_devolucao: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      });

      return redirect("/sucesso/biblioteca-devolucao");
    }

    if (action === "cadastrar_livro") {
      if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
        return json({ success: false, error: "Sem permissão" }, { status: 403 });
      }
      const dadosLivro = {
        title: formData.get("titulo") as string,
        author: formData.get("autor") as string,
        register: formData.get("codigo") as string,
        year: formData.get("ano") ? parseInt(formData.get("ano") as string) : null,
        type: formData.get("tipo") as string,
        isbn: formData.get("isbn") as string || null,
        resumo: formData.get("resumo") as string || null,
        consulta_local: formData.get("consulta_local") === "on",
        created_at: new Date().toISOString()
      };

      const livroRef = db.ref("library");
      await livroRef.push(dadosLivro);
      return redirect("/sucesso/biblioteca-cadastro");
    }

    if (action === "atualizar_livro") {
      if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
        return json({ success: false, error: "Sem permissão" }, { status: 403 });
      }
      const firebaseKey = formData.get("firebaseKey") as string;
      const dadosAtualizacao = {
        title: formData.get("titulo") as string,
        author: formData.get("autor") as string,
        register: formData.get("codigo") as string,
        year: formData.get("ano") ? parseInt(formData.get("ano") as string) : null,
        type: formData.get("tipo") as string,
        isbn: formData.get("isbn") as string || null,
        resumo: formData.get("resumo") as string || null,
        updated_at: new Date().toISOString()
      };

      const livroRef = db.ref(`library/${firebaseKey}`);
      await livroRef.update(dadosAtualizacao);
      return redirect("/sucesso/biblioteca-atualizada");
    }

    return json({ success: false, error: "Ação não reconhecida" });
  } catch (error: any) {
    console.error("Erro na ação da gestão da biblioteca:", error);
    return json({ success: false, error: error.message }, { status: 400 });
  }
}

export default function BibliotecaGestaoRoute() {
  const { livros, emprestimos, solicitacoes, users } = useLoaderData<typeof loader>();
  const { userPermissions } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <BackButton />
      </div>
      <BibliotecaGestao
        emprestimos={emprestimos}
        solicitacoes={solicitacoes}
        livros={livros}
        users={users}
        userPermissions={userPermissions}
      />
    </div>
  );
}
