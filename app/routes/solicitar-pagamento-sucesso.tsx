import { useNavigate } from "@remix-run/react";
import ButtonList from "~/components/ButtonList";
import Unauthorized from "~/hooks/Unauthorized";
import { getUserCategories } from "~/mockup/usersOLD";
import { ButtonItem, UserCategory } from "~/utils/types";

export default function Sucesso() {
  const navigate = useNavigate();
  const userId = 157783985; // Substitua com a lógica real para obter o ID do usuário

  // Verifica se o usuário tem permissão para acessar a página
  const isAuthorized = getUserCategories(userId).includes(
    UserCategory.AMECICLISTAS
  );

  if (!isAuthorized) {
    return (
      <Unauthorized
        pageName="Página de Sucesso"
        requiredPermission="AMECICLISTAS"
      />
    );
  }

  const buttons: ButtonItem[] = [
    {
      label: "Solicitar Novo Pagamento",
      onClick: () => navigate("/solicitar-pagamento"),
      type: "primary", // Agora está correto
    },
    {
      label: "Voltar",
      onClick: () => navigate(-1),
      type: "secondary", // Agora está correto
    },
  ];

  return (
    <div className="container">
      <h2 className="text-primary">✅ Solicitação Enviada com Sucesso!</h2>
      <p>A sua solicitação de pagamento foi processada e está em andamento.</p>

      <ButtonList buttons={buttons} />
    </div>
  );
}
