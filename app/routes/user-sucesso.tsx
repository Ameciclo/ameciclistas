import SuccessPage from "~/components/SucessPage";

export default function Sucesso() {
  return (
    <SuccessPage
      title="✅ Usuário registrado com sucesso!"
      message="Agora você tem acesso a outros botões na página principal."
      actions={[{ label: "⬅️ Voltar", to: "/" }]}
    />
  );
}
