// routes/sucesso.tsx
import { useNavigate } from "@remix-run/react";
import Unauthorized from "~/components/Unauthorized";
import { getUserCategories, UserCategory } from "~/api/users";

export default function Sucesso() {
  const navigate = useNavigate();
  const userId = 157783985; // Substitua com a lógica real para obter o ID do usuário

  // Verifica se o usuário tem permissão para acessar a página
  const isAuthorized = getUserCategories(userId).includes(UserCategory.AMECICLISTAS);

  if (!isAuthorized) {
    return (
      <Unauthorized
        pageName="Página de Sucesso"
        requiredPermission="AMECICLISTAS"
      />
    );
  }

  return (
    <div className="container">
      <h2 className="text-primary">✅ Solicitação Enviada com Sucesso!</h2>
      <p>A sua solicitação de pagamento foi processada e está em andamento.</p>
      
      <div className="button-group">
        <button
          className="button-primary"
          onClick={() => navigate("/solicitar-pagamento")}
        >
          Solicitar Novo Pagamento
        </button>
        <button
          className="button-secondary"
          onClick={() => navigate(-1)} // Voltar à página anterior
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
