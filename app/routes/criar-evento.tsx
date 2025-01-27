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
  const [title, setTitle] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [hour, setHour] = useState<string>("");
  const [end_hour, setEndHour] = useState<string>("");
  const [durationMessage, setDurationMessage] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [agenda, setAgenda] = useState<string>("");
  const [gt, setGT] = useState<string>("");

  useEffect(() => setUser(() => getTelegramUsersInfo()), []);

  useEffect(() => {
    if (user?.id && usersInfo[user.id]) {
      setUserPermissions([usersInfo[user.id].role as any]);
    }
  }, [user]);

  const isFormValid =
    title !== "" &&
    date !== "" &&
    hour !== "" &&
    durationMessage !== "" &&
    durationMessage !== "Duração do evento deve ser no mínimo 10" &&
    durationMessage !== "Confira preenchimento de horário" &&
    duration !== "" &&
    description !== "" &&
    agenda !== "" &&
    gt !== "";



  useEffect(() => {
    if (hour && end_hour) {
      const [startHours, startMinutes] = hour.split(':').map(Number);
      const [endHours, endMinutes] = end_hour.split(':').map(Number);

      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      const durationMinutes = endTotalMinutes - startTotalMinutes;
      const durationHour = durationMinutes/60;
      
      setDuration(String(durationHour));

      if(durationMinutes >= 10) setDurationMessage("Duração: " + String(durationMinutes) + " minutos.");
      if(durationMinutes >= 0 && durationMinutes <= 10) setDurationMessage("** A duração do evento precisa ser maior que 10 minutos");
      if(durationMinutes < 0) setDurationMessage("*** Confira preenchimento de horário");
    }
  }, [hour, end_hour]);

  return isAuth(userPermissions, UserCategory.AMECICLISTAS) ? (
    <Form className="container" method="post">
      <FormTitle>📅 Criar Evento</FormTitle>

      <NumberInput label="Título do Evento:" value={title} onChange={(e: any) => setTitle(e.target.value)} />

      <DateInput
        value={date}
        onChange={(e: any) => setDate(e.target.value)}
      />

      <HourInput
        value={hour}
        label="Hora Início:"
        onChange={(e: any) => setHour(e.target.value)}
      />

      <HourInput
        value={end_hour}
        label="Hora Fim:"
        onChange={(e: any) => setEndHour(e.target.value)}
      />

      {durationMessage && (<h3>{durationMessage}</h3>)}

      <br />
      <DescriptionInput descricao={description} setDescricao={setDescription} />

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
          { name: "titulo", value: title },
          { name: "data", value: date },
          { name: "hora", value: hour },
          { name: "hora_fim", value: end_hour },
          { name: "duracao", value: duration },
          { name: "descricao", value: description },
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
