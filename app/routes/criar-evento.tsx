import { Form, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getTelegramUserInfo } from "../utils/users";
import { UserCategory, UserData } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";
import Unauthorized from "~/components/Unauthorized";
import { BackButton } from "~/components/CommonButtons";
import { action } from "~/handlers/actions/criar-evento";
import { loader } from "~/handlers/loaders/criar-evento";
export { loader, action };

import SelectInput from "~/components/Forms/Inputs/SelectInput";
import NumberInput from "~/components/Forms/Inputs/NumberInput";
import DescriptionInput from "~/components/Forms/Inputs/DescriptionInput";
import SendToAction from "~/components/SendToAction";
import HourInput from "~/components/Forms/Inputs/HourInput";
import DateInput from "~/components/Forms/Inputs/DateInput";
import SubmitButton from "~/components/SubmitButton";
import FormTitle from "~/components/Forms/FormTitle";

export default function CriarEvento() {
  const { userCategoriesObject, currentUserCategories } =
    useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [userInfo, setUserInfo] = useState<UserData | null>({} as UserData);
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState<string>("");
  const [hora, setHora] = useState<string>("");
  const [duracao, setDuracao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [agenda, setAgenda] = useState("");

  useEffect(() => setUserInfo(() => getTelegramUserInfo()), []);

  useEffect(() => {
    if (userInfo?.id && userCategoriesObject[userInfo.id]) {
      setUserPermissions([userCategoriesObject[userInfo.id] as any]);
    }
  }, [userInfo]);

  const isFormValid =
    titulo !== "" &&
    data !== "" &&
    hora !== "" &&
    duracao !== "" &&
    descricao !== "" &&
    agenda !== "";

  return isAuth(userPermissions, UserCategory.AMECICLISTAS) ? (
    <Form className="container" method="post">
      <FormTitle>📅 Criar Evento</FormTitle>

      <NumberInput label="Título do Evento:" value={titulo} onChange={(e: any) => setTitulo(e.target.value)} />

      <DateInput
        value={data}
        onChange={(e: any) => setData(e.target.value)}
      />

      <HourInput
        value={hora}
        onChange={(e: any) => setHora(e.target.value)}
      />

      <NumberInput
        label="Duração (em horas):"
        type="number"
        value={duracao}
        onChange={(e: any) => setDuracao(e.target.value)}
        min="0"
        step="0.5"
        placeholder="Ex: 1.5"
      />
      <DescriptionInput descricao={descricao} setDescricao={setDescricao} />

      <SelectInput
        label="Agenda: "
        value={agenda}
        onChange={(e: any) => setAgenda(e.target.value)}
        options={[
          { value: "", label: "Selecione uma agenda" },
          { value: "Eventos Internos", label: "Eventos Internos" },
          { value: "Eventos Externos", label: "Eventos Externos" },
          { value: "Divulgação de eventos externos", label: "Divulgação de eventos externos" },
          { value: "Organizacional", label: "Organizacional" },
        ]}
      />

      <SendToAction
        fields={[
          { name: "titulo", value: titulo },
          { name: "data", value: data },
          { name: "hora", value: hora },
          { name: "duracao", value: duracao },
          { name: "descricao", value: descricao },
          { name: "agenda", value: agenda },
          { name: "from", value: JSON.stringify(userInfo) },
        ]}
      />

      <SubmitButton
        label="Criar Evento"
        isEnabled={isFormValid}
      />

      <BackButton />
    </Form >
  ) : (
    <Unauthorized pageName="Criar Evento" requiredPermission="Ameciclista" />
  );
}
