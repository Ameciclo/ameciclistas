import { Form, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getTelegramUsersInfo } from "../utils/users";
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
  const { usersInfo, currentUserCategories } =
    useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [user, setUser] = useState<UserData | null>({} as UserData);
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState<string>("");
  const [hora, setHora] = useState<string>("");
  const [hora_fim, setHoraFim] = useState<string>("");
  const [duracao, setDuracao] = useState<string>("");
  const [descricao, setDescricao] = useState("");
  const [agenda, setAgenda] = useState("");
  const [gt, setGT] = useState("");

  useEffect(() => setUser(() => getTelegramUsersInfo()), []);

  useEffect(() => {
    if (user?.id && usersInfo[user.id]) {
      setUserPermissions([usersInfo[user.id].role as any]);
    }
  }, [user]);

  const isFormValid =
    titulo !== "" &&
    data !== "" &&
    hora !== "" &&
    duracao !== "" &&
    duracao !== "Duração do evento deve ser no mínimo 10" &&
    duracao !== "Confira preenchimento de horário" &&
    descricao !== "" &&
    agenda !== "" &&
    gt !== "";



  useEffect(() => {
    if (hora && hora_fim) {
      const [startHours, startMinutes] = hora.split(':').map(Number);
      const [endHours, endMinutes] = hora_fim.split(':').map(Number);

      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      const durationMinutes = endTotalMinutes - startTotalMinutes;

      if(durationMinutes >= 10) setDuracao(String(durationMinutes) + " minutos.");
      if(durationMinutes >= 0 && durationMinutes <= 10) setDuracao("Duração do evento deve ser no mínimo 10");
      if(durationMinutes < 0) setDuracao("Confira preenchimento de horário");
    }
  }, [hora, hora_fim]);

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
        label="Hora Início:"
        onChange={(e: any) => setHora(e.target.value)}
      />

      <HourInput
        value={hora_fim}
        label="Hora Fim:"
        onChange={(e: any) => setHoraFim(e.target.value)}
      />

      {duracao && (<h3>[ DURAÇÃO: {duracao} ]</h3>)}

      <br />
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

      <SelectInput
        label="Grupo de Trabalho (GT): "
        value={gt}
        onChange={(e: any) => setGT(e.target.value)}
        options={[
          {
            value: "",
            label: "Selecione um GT"
          },
          {
            value: "Incidência",
            label: "Incidência"
          },
          {
            value: "Pesquisa",
            label: "Pesquisa"
          },
          {
            value: "Formação Externa",
            label: "Formação Externa"
          },
          {
            value: "Interpautas",
            label: "Interpautas"
          },
          {
            value: "Escola da Bicicleta",
            label: "Escola da Bicicleta"
          },
          {
            value: "Cultura",
            label: "Cultura"
          }

        ]}
      />

      <SendToAction
        fields={[
          { name: "titulo", value: titulo },
          { name: "data", value: data },
          { name: "hora", value: hora },
          { name: "hora_fim", value: hora_fim },
          { name: "duracao", value: duracao },
          { name: "descricao", value: descricao },
          { name: "agenda", value: agenda },
          { name: "grupo_de_trabalho", value: gt },
          { name: "from", value: JSON.stringify(user) },
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
