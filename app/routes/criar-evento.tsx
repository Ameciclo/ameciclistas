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

import FormGroup from "~/components/Forms/FormGroup";
import SelectInput from "~/components/Forms/Inputs/SelectInput";
import TextInput from "~/components/Forms/Inputs/TextInput";
import TextAreaInput from "~/components/Forms/Inputs/TextAreaInput";

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
    descricao !== "";

  return isAuth(userPermissions, UserCategory.AMECICLISTAS) ? (
    <Form className="container" method="post">
      <h2 className="text-primary">📅 Criar Evento</h2>

      <FormGroup label="Título do Evento:">
        <TextInput value={titulo} onChange={(e: any) => setTitulo(e.target.value)} />
      </FormGroup>

      <FormGroup label="Data:">
        <TextInput
          type="date"
          value={data}
          onChange={(e: any) => setData(e.target.value)}
        />
      </FormGroup>

      <FormGroup label="Hora:">
        <TextInput
          type="time"
          value={hora}
          onChange={(e: any) => setHora(e.target.value)}
        />
      </FormGroup>

      <FormGroup label="Duração (em horas):">
        <TextInput
          type="number"
          value={duracao}
          onChange={(e: any) => setDuracao(e.target.value)}
          min="0"
          step="0.5"
          placeholder="Ex: 1.5"
        />
      </FormGroup>

      <FormGroup label="Descrição:">
        <TextAreaInput
          value={descricao}
          onChange={(e: any) => setDescricao(e.target.value)}
          rows={4}
        />
      </FormGroup>

      <FormGroup label="Agenda:">
        <SelectInput
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
      </FormGroup>

      <input type="hidden" name="titulo" value={titulo} />
      <input type="hidden" name="data" value={data} />
      <input type="hidden" name="hora" value={hora} />
      <input type="hidden" name="duracao" value={duracao} />
      <input type="hidden" name="descricao" value={descricao} />
      <input type="hidden" name="agenda" value={agenda} />
      <input type="hidden" name="from" value={JSON.stringify(userInfo)} />

      <button
        type="submit"
        className={isFormValid ? "button-full" : "button-full button-disabled"}
        disabled={!isFormValid}
      >
        Criar Evento
      </button>

      <BackButton />
    </Form>
  ) : (
    <Unauthorized pageName="Criar Evento" requiredPermission="Ameciclista" />
  );
}
