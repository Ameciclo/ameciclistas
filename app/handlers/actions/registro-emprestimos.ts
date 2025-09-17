import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { 
  solicitarEmprestimoInventario, 
  aprovarSolicitacaoInventario, 
  rejeitarSolicitacaoInventario, 
  registrarDevolucaoInventario,
  cadastrarItemInventario,
  getUsersFirebase 
} from "~/api/firebaseConnection.server";
import { getTelegramUsersInfo } from "~/utils/users";
import { UserCategory } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";

export async function registroEmprestimosAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;
  
  console.log("=== REGISTRO EMPRÉSTIMOS ACTION ===");
  console.log("Action:", action);
  console.log("FormData:", Object.fromEntries(formData));
  console.log("===================================");

  try {
    const users = await getUsersFirebase();
    const telegramUser = getTelegramUsersInfo();
    
    let userId = telegramUser?.id;
    let userPermissions = [UserCategory.ANY_USER];
    
    if (process.env.NODE_ENV === "development" && !userId) {
      userId = 123456789;
      userPermissions = [UserCategory.PROJECT_COORDINATORS];
    } else if (userId && users[userId]) {
      userPermissions = [users[userId].role];
    }

    switch (action) {
      case "solicitar":
        if (!userId) {
          throw new Error("Usuário não identificado");
        }
        
        const codigoItem = formData.get("codigo") as string;
        
        // Se é coordenador de projeto, vai direto para emprestado
        if (isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
          await aprovarSolicitacaoInventario("", userId, codigoItem, true);
          return redirect("/sucesso/inventario-aprovado");
        } else {
          await solicitarEmprestimoInventario(userId, codigoItem);
          return redirect("/registro-emprestimos");
        }

      case "aprovar_solicitacao":
        if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
          throw new Error("Sem permissão para aprovar solicitações");
        }
        
        const solicitacaoId = formData.get("solicitacao_id") as string;
        await aprovarSolicitacaoInventario(solicitacaoId, userId!, "", false);
        return redirect("/sucesso/inventario-aprovado");

      case "rejeitar_solicitacao":
        if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
          throw new Error("Sem permissão para rejeitar solicitações");
        }
        
        const solicitacaoIdRejeitar = formData.get("solicitacao_id") as string;
        await rejeitarSolicitacaoInventario(solicitacaoIdRejeitar);
        return redirect("/sucesso/inventario-rejeitado");

      case "registrar_devolucao":
        if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
          throw new Error("Sem permissão para registrar devoluções");
        }
        
        const emprestimoId = formData.get("emprestimo_id") as string;
        await registrarDevolucaoInventario(emprestimoId);
        return redirect("/sucesso/inventario-devolucao");

      case "cadastrar_item":
        if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
          throw new Error("Sem permissão para cadastrar itens");
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
        return redirect("/sucesso/inventario-cadastro");

      default:
        throw new Error("Ação não reconhecida");
    }
  } catch (error) {
    console.error("Erro na ação do registro de empréstimos:", error);
    return json({ error: error.message }, { status: 400 });
  }
}