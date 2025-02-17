import { Form, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getTelegramUsersInfo } from "../utils/users";
import { UserCategory, UserData } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";
import Unauthorized from "~/components/Unauthorized";
import { BackButton } from "~/components/Forms/CommonButtons";
import { action } from "~/handlers/actions/criar-evento";
import { loader } from "~/handlers/loaders/criar-evento";
export { loader, action };

import SelectInput from "~/components/Forms/Inputs/SelectInput";
import NumberInput from "~/components/Forms/Inputs/NumberInput";
import DescriptionInput from "~/components/Forms/Inputs/LongTextInput";
import SendToAction from "~/components/Forms/SendToAction";
import HourInput from "~/components/Forms/Inputs/HourInput";
import DateInput from "~/components/Forms/Inputs/DateInput";
import SubmitButton from "~/components/Forms/SubmitButton";
import FormTitle from "~/components/Forms/FormTitle";

export default function CriarEvento() {
  const { usersInfo, currentUserCategories } = useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [user, setUser] = useState<UserData | null>({} as UserData);
  const [name, setName] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [durationMessage, setDurationMessage] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [calendarId, setCalendarId] = useState<string>("");
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
    durationMessage !==
      "** A duração do evento precisa ser maior que 10 minutos" &&
    durationMessage !== "*** Confira preenchimento de horário" &&
    description !== "" &&
    calendarId !== "" &&
    workGroup !== "";

  useEffect(() => {
    if (startTime && endTime) {
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      const durationMinutes = endTotalMinutes - startTotalMinutes;

      if (durationMinutes >= 10)
        setDurationMessage("Duração: " + String(durationMinutes) + " minutos.");
      if (durationMinutes >= 0 && durationMinutes <= 10)
        setDurationMessage(
          "** A duração do evento precisa ser maior que 10 minutos"
        );
      if (durationMinutes < 0)
        setDurationMessage("*** Confira preenchimento de horário");
    }
  }, [startTime, endTime]);

  return isAuth(userPermissions, UserCategory.AMECICLISTAS) ? (
    <Form className="container" method="post">
      <FormTitle>📅 Criar Evento</FormTitle>

      <NumberInput
        label="Nome do Evento:"
        value={name}
        onChange={(e: any) => setName(e.target.value)}
      />

      <DateInput value={date} onChange={(e: any) => setDate(e.target.value)} />

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

      {durationMessage && <h3>{durationMessage}</h3>}

      <br />
      <DescriptionInput
        title={"Descrição"}
        text={description}
        setText={setDescription}
      />

      <NumberInput
        label="Local do Evento:"
        value={location}
        onChange={(e: any) => setLocation(e.target.value)}
      />

      <SelectInput
        label="Agenda: "
        value={calendarId}
        onChange={(e: any) => setCalendarId(e.target.value)}
        options={[
          { value: "", label: "Selecione uma agenda" },
          { value: "ameciclo@gmail.com", label: "Eventos Internos" },
          {
            value: "oj4bkgv1g6cmcbtsap4obgi9vc@group.calendar.google.com",
            label: "Eventos Externos",
          },
          {
            value: "k0gbrljrh0e4l2v8cuc05nsljc@group.calendar.google.com",
            label: "Divulgação de eventos externos",
          },
          {
            value: "an6nh96auj9n3jtj28qno1limg@group.calendar.google.com",
            label: "Organizacional",
          },
        ]}
      />

      <SelectInput
        label="Grupo de Trabalho (GT): "
        value={workGroup}
        onChange={(e: any) => setWorkGroup(e.target.value)}
        options={[
          {
            value: "",
            label: "Selecione um GT",
          },
          {
            value: "-1001163972258",
            label: "Incidência",
          },
          {
            value: "-1001434654374",
            label: "Pesquisa",
          },
          {
            value: "-1001262630444",
            label: "Formação Externa",
          },
          {
            value: "-1001283224155",
            label: "Interpautas",
          },
          {
            value: "-1001387463477",
            label: "Escola de Cicloativismo",
          },
          {
            value: "-1002002954299",
            label: "Cultura",
          },
          {
            value: "-1001378328092",
            label: "Algum dos Eixos",
          },
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
          { name: "calendarId", value: calendarId },
          { name: "workgroup", value: workGroup },
          { name: "from", value: JSON.stringify(user) },
        ]}
      />

      <SubmitButton label="Criar Evento" isEnabled={isFormValid} />

      <BackButton />
    </Form>
  ) : (
    <Unauthorized pageName="Criar Evento" requiredPermission="Ameciclista" />
  );
}
