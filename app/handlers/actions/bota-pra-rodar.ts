import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { 
  solicitarEmprestimoBicicleta, 
  aprovarSolicitacaoBicicleta, 
  rejeitarSolicitacaoBicicleta, 
  registrarDevolucaoBicicleta,
  cadastrarBicicleta,
  getUsersFirebase 
} from "~/api/firebaseConnection.server";
import { getTelegramUsersInfo } from "~/utils/users";
import { UserCategory } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";

export async function botaPraRodarAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;

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
        
        const codigoBicicleta = formData.get("codigo_bicicleta") as string;
        
        // Se é coordenador de projeto, vai direto para emprestado
        if (isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
          await aprovarSolicitacaoBicicleta("", userId, codigoBicicleta, true);
        } else {
          await solicitarEmprestimoBicicleta(userId, codigoBicicleta);
        }
        
        return redirect("/bota-pra-rodar");

      case "aprovar_solicitacao":
        if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
          throw new Error("Sem permissão para aprovar solicitações");
        }
        
        const solicitacaoId = formData.get("solicitacao_id") as string;
        await aprovarSolicitacaoBicicleta(solicitacaoId, userId!, "", false);
        return redirect("/bota-pra-rodar");

      case "rejeitar_solicitacao":
        if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
          throw new Error("Sem permissão para rejeitar solicitações");
        }
        
        const solicitacaoIdRejeitar = formData.get("solicitacao_id") as string;
        await rejeitarSolicitacaoBicicleta(solicitacaoIdRejeitar);
        return redirect("/bota-pra-rodar");

      case "registrar_devolucao":
        if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
          throw new Error("Sem permissão para registrar devoluções");
        }
        
        const emprestimoId = formData.get("emprestimo_id") as string;
        await registrarDevolucaoBicicleta(emprestimoId);
        return redirect("/bota-pra-rodar");

      case "cadastrar_bicicleta":
        if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
          throw new Error("Sem permissão para cadastrar bicicletas");
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
        return redirect("/bota-pra-rodar");

      default:
        throw new Error("Ação não reconhecida");
    }
  } catch (error) {
    console.error("Erro na ação do Bota pra Rodar:", error);
    return json({ error: error.message }, { status: 400 });
  }
}