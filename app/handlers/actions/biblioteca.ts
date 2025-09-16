import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
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
      

    
    if (action === "aprovar_solicitacao") {
      const solicitacao_id = formData.get("solicitacao_id") as string;
      
      try {
        // Atualizar status da solicitação
        const solicitacaoRef = db.ref(`biblioteca_solicitacoes/${solicitacao_id}`);
        await solicitacaoRef.update({
          status: 'aprovada',
          updated_at: new Date().toISOString()
        });
        
        // Criar empréstimo
        const emprestimoRef = db.ref("loan_record");
        const solicitacaoSnapshot = await solicitacaoRef.once("value");
        const solicitacao = solicitacaoSnapshot.val();
        
        if (solicitacao) {
          const novoEmprestimo = {
            usuario_id: solicitacao.usuario_id,
            subcodigo: solicitacao.subcodigo,
            data_saida: new Date().toISOString().split('T')[0],
            status: 'emprestado',
            created_at: new Date().toISOString()
          };
          
          console.log("Criando empréstimo:", novoEmprestimo);
          await emprestimoRef.push(novoEmprestimo);
        }
        
        return redirect("/sucesso/biblioteca-aprovada");
      } catch (error) {
        console.error("Erro ao aprovar solicitação:", error);
        return json({ success: false, error: "Erro ao aprovar solicitação" });
      }
    }
    
    if (action === "rejeitar_solicitacao") {
      const solicitacao_id = formData.get("solicitacao_id") as string;
      
      try {
        const solicitacaoRef = db.ref(`biblioteca_solicitacoes/${solicitacao_id}`);
        await solicitacaoRef.update({
          status: 'rejeitada',
          updated_at: new Date().toISOString()
        });
        
        return redirect("/sucesso/biblioteca-rejeitada");
      } catch (error) {
        console.error("Erro ao rejeitar solicitação:", error);
        return json({ success: false, error: "Erro ao rejeitar solicitação" });
      }
    }
    
    if (action === "registrar_devolucao") {
      const emprestimo_id = formData.get("emprestimo_id") as string;
      
      try {
        const emprestimoRef = db.ref(`loan_record/${emprestimo_id}`);
        await emprestimoRef.update({
          status: 'devolvido',
          data_devolucao: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        });
        
        return redirect("/sucesso/biblioteca-devolucao");
      } catch (error) {
        console.error("Erro ao registrar devolução:", error);
        return json({ success: false, error: "Erro ao registrar devolução" });
      }
    }
    
    if (action === "cadastrar_livro") {
      try {
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
      } catch (error) {
        console.error("Erro ao cadastrar livro:", error);
        return json({ success: false, error: "Erro ao cadastrar livro" });
      }
    }
    

    
    return json({ success: false, error: "Ação não reconhecida" });
    
  } catch (error) {
    console.error("Erro na ação da biblioteca:", error);
    return json({ success: false, error: "Erro interno do servidor" });
  }
}