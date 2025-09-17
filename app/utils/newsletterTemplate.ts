interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  imageUrl?: string;
}

export function generateNewsletterHtml(events: CalendarEvent[]): string {
  if (!events.length) return "";

  const month = getMonthName(events[0].startTime);
  const year = events[0].startTime.getFullYear();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Boletim Informativo da Ameciclo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style> html { -webkit-print-color-adjust: exact; } </style>
</head>
<body style="margin: 0; padding: 0;">
  <table style="color:blue; background-color: #f0f8ff;" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td bgcolor="#008080" style="padding: 40px 0 30px 0;">
        <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;" width="100%">
          <tr>
            <td style="color: #ffffff; font-family: Ubuntu, sans-serif; font-size: 24px; font-weight: 100;" align="right">
              BOLETIM<br />INFORMATIVO
            </td>
            <td align="center" width="200">
              <a href="http://www.ameciclo.org/">
                <img src="https://ameciclo.org/wp-content/uploads/2023/01/logo-ameciclo-branco.png" alt="Logo da Ameciclo" width="100" style="display: block;" />
              </a>
            </td>
            <td align="left" style="color: #ffffff; font-family: Ubuntu, sans-serif; font-size: 24px; font-weight: 100;">
              ${month} de ${year}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="720" style="border-collapse: collapse;">
          <tr>
            <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
              ${generateEventsHtml(events)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td bgcolor="#008080" style="padding: 40px 40px 40px 40px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding-right:15px">
              <a href="http://www.ameciclo.org/">
                <img src="https://ameciclo.org/wp-content/uploads/2023/01/logo-ameciclo-branco.png" alt="Ameciclo" height="50" style="display: block;" border="0" />
              </a>
            </td>
            <td style="font-size: 0; line-height: 0;" width="20">
              &nbsp;
            </td>
            <td width="75%">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="color: #ffffff; font-family: Ubuntu, sans-serif; font-size: 18px; font-weight: 100;">
                    Associação Metropolitana de Ciclistas do Recife
                  </td>
                </tr>
                <tr>
                  <td style="color: #ffffff; font-family: Ubuntu, sans-serif; font-size: 14px; font-weight: 100;">
                    R. da Aurora, 529, loja 2 - Santo Amaro Recife/PE<br />CEP:50050-145 - Fone: +55 81 99786 0060
                  </td>
                </tr>
              </table>
            </td>
            <td align="right" style="padding:20px 0px 0px 0px">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  ${generateSocialMediaHtml()}
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateEventsHtml(events: CalendarEvent[]): string {
  return events.map(event => generateEventHtml(event)).join('');
}

function generateEventHtml(event: CalendarEvent): string {
  const isHighlight = event.description.includes("DESTAQUE");
  const titleFontSize = isHighlight ? 26 : 18;
  
  const day = isHighlight 
    ? "" 
    : `Dia ${addZeroToInt(event.startTime.getDate())} - `;

  const imageUrl = event.imageUrl || "https://via.placeholder.com/260x150/008080/ffffff?text=Evento+Ameciclo";
  
  // Para o template HTML, manter formatação mas limpar apenas tags problemáticas
  const description = event.description
    .replace(/\n/g, "<br>")
    .replace("DESTAQUE ", "")
    .replace("RECORRENTE ", "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .split("<br>")[0]; // Primeira linha apenas

  return `
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="justify" style="color: #ff0000; font-family: Ubuntu, sans-serif; font-size: ${titleFontSize}px; font-weight: 400; padding:25px 0px 5px 0px">
      ${day}${event.title}
    </td>
  </tr>
  <tr>
    <td width="260" valign="top" style="color: #153643; font-family: Ubuntu, sans-serif; font-size: 14px;">
      <table>
        <tr style="padding: 20px 0 20px 0;">
          <td valign="top">
            <img src="${imageUrl}" alt="Imagem do Evento" style="float:left; width:260px; padding-right:20px">
          </td>
          <td align="justify" valign="top" style="font-family: Ubuntu, sans-serif;">
            ${description}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="font-size: 0; line-height: 0;" width="20">
      &nbsp;
    </td>
  </tr>
</table>`;
}

function generateSocialMediaHtml(): string {
  const socialMedia = [
    { name: "instagram", url: "http://www.instagram.com/Ameciclo" },
    { name: "youtube", url: "https://www.youtube.com/@ameciclo" },
    { name: "linkedin", url: "https://www.linkedin.com/company/ameciclo" },
    { name: "telegram-app", url: "https://t.me/s/ameciclo" },
    { name: "whatsapp", url: "https://wa.me/5581997860060?text=Olá,%20Ameciclo!" },
    { name: "github", url: "https://github.com/ameciclo" }
  ];

  return socialMedia.map(social => `
    <td>
      <a href="${social.url}">
        <img src="https://img.icons8.com/ios-filled/50/ffffff/${social.name}.png" alt="Logo ${social.name}" height="30" style="display: block;" border="0" />
      </a>
    </td>
    <td style="font-size: 0; line-height: 0">
      &nbsp;
    </td>
  `).join('');
}

function addZeroToInt(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

function getMonthName(date: Date): string {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return months[date.getMonth()];
}