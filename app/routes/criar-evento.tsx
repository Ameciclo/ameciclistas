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
  const [name, setName] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [durationMessage, setDurationMessage] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [calendar, setCalendar] = useState<string>("");
  const [workGroup, setWorkGroup] = useState<string>("");

  useEffect(() => setUser(() => getTelegramUsersInfo()), []);

  useEffect(() => {
    if (user?.id && usersInfo[user.id]) {
      setUserPermissions([usersInfo[user.id].role as any]);
    }
  }, [user]);

  const isFormValid =
    name !== "" &&
    date !== "" &&
    startTime !== "" &&
    durationMessage !== "" &&
    durationMessage !== "** A duração do evento precisa ser maior que 10 minutos" &&
    durationMessage !== "*** Confira preenchimento de horário" &&
    description !== "" &&
    calendar !== "" &&
    workGroup !== "";



  useEffect(() => {
    if (startTime && endTime) {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      const durationMinutes = endTotalMinutes - startTotalMinutes;
           
      if(durationMinutes >= 10) setDurationMessage("Duração: " + String(durationMinutes) + " minutos.");
      if(durationMinutes >= 0 && durationMinutes <= 10) setDurationMessage("** A duração do evento precisa ser maior que 10 minutos");
      if(durationMinutes < 0) setDurationMessage("*** Confira preenchimento de horário");
    }
  }, [startTime, endTime]);

  return isAuth(userPermissions, UserCategory.AMECICLISTAS) ? (
    <Form className="container" method="post">
      <FormTitle>📅 Criar Evento</FormTitle>

      <NumberInput label="Nome do Evento:" value={name} onChange={(e: any) => setName(e.target.value)} />

      <DateInput
        value={date}
        onChange={(e: any) => setDate(e.target.value)}
      />

      <HourInput
        value={startTime}
        label="Hora Início:"
        onChange={(e: any) => setStartTime(e.target.value)}
      />

      <HourInput
        value={endTime}
        label="Hora Fim:"
        onChange={(e: any) => setEndTime(e.target.value)}
      />

      {durationMessage && (<h3>{durationMessage}</h3>)}

      <br />
      <DescriptionInput descricao={description} setDescricao={setDescription} />

      <NumberInput label="Local do Evento:" value={location} onChange={(e: any) => setLocation(e.target.value)} />

      <SelectInput
        label="Agenda: "
        value={calendar}
        onChange={(e: any) => setCalendar(e.target.value)}
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
        value={workGroup}
        onChange={(e: any) => setWorkGroup(e.target.value)}
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
          },
          {
            value: "Eixos",
            label: "Algum dos Eixos"
          }

        ]}
      />

      <SendToAction
        fields={[
          { name: "name", value: name },
          { name: "date", value: date },
          { name: "startTime", value: startTime },
          { name: "endTime", value: endTime },
          { name: "description", value: description },
          { name: "location", value: location },
          { name: "calendar", value: calendar },
          { name: "workgroup", value: workGroup },
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
