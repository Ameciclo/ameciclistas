import { json, type ActionFunctionArgs } from "@remix-run/node";
import db from "~/api/firebaseAdmin.server.js";
import type { Emprestimo, SolicitacaoEmprestimo } from "~/utils/types";

export async function bibliotecaAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;
  
  try {
    if (action === "solicitar") {
      const subcodigo = formData.get("subcodigo") as string;
      const usuario_id = formData.get("usuario_id") as string;
      
      console.log("Solicitação recebida:", { subcodigo, usuario_id });
      
      // Salvar solicitação no Firebase
      const solicitacaoRef = db.ref("biblioteca_solicitacoes");
      const novaSolicitacao = {
        usuario_id,
        subcodigo,
        data_solicitacao: new Date().toISOString().split('T')[0],
        status: 'pendente',
        created_at: new Date().toISOString()
      };
      
      await solicitacaoRef.push(novaSolicitacao);
      
      return json({ success: true, message: "Solicitação enviada com sucesso!" });
    }
      

    
    // Outras ações podem ser implementadas aqui
    

    
    return json({ success: false, error: "Ação não reconhecida" });
    
  } catch (error) {
    console.error("Erro na ação da biblioteca:", error);
    return json({ success: false, error: "Erro interno do servidor" });
  }
}