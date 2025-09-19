function devs() {
  newletter(getDevs(), true)
}

function dev() {
  newletter(getDev(), true)
}

function prod() {
  newletter(getEmailsList())
}

function newletter(emails, devMode = false) {
  // TÍTULO
  const subject = getSubject()
  // EVENTOS
  const calendars_ids = getCalendars()
  const events = getDatedSortedEventsByCalendarsId(calendars_ids)
  // CORPO
  const html = getNewsletterHtml(events)
  emails.forEach(email => sendEmail(email,subject, html))
  if (!devMode) {
    saveImages(events)
    htmlToPDF(getNewsletterHtml(events, true), getSubject())
  }
}

function getSubject() {
  const date = getFirstAndLastMonthDays().first_day
  return "Boletim informativo " + getMonthsNameByDate(date) + " de " + date.getFullYear()
}

function getNewsletterHtml(events, isPDF = false) {
  return "" +
    "<!DOCTYPE html>" +
      "<html>" +
        getHtmlHead() +
        getBody(events, isPDF) +
      "</html>"
}

function getHtmlHead() {
  return "" + 
    "<head>" +
      "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />" +
      "<title>Boletim Informativo da Ameciclo</title>" + 
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>" +
      "<style> html { -webkit-print-color-adjust: exact; } </style>" + 
    "</head>"
}

// textoFinal na verdade é o corpo da tabela com os eventos
function getBody (events, isPDF = false) {
  const month = getMonthsNameByDate(events[0].getStartTime())
  const year = events[0].getStartTime().getFullYear()
  const title = "BOLETIM<br />INFORMATIVO "
  const background = getImages().background
  const institution = getInstitutionData()
  let institution_logo = institution.logo
  if(isPDF) institution_logo = getImageCoded(institution.logo)
  const social_media = getSocialMedia()
  return "" +
    "<body style=\"margin: 0; padding: 0;\">" +
      "<table style=\"color:blue;\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" background=\"" + background + "\">" +
        "<tr>" +
          "<td bgcolor=\"#008080\" style=\"padding: 40px 0 30px 0;\">" +
              "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse: collapse;\"  width=\"100%\">" +
                "<tr>" +
                  "<td style=\"color: #ffffff; font-family: Ubuntu, sans-serif; font-size: 24px; font-weight: 100; \" align=\"right\" >" +
                    title +
                  "</td>" +
                  "<td align=\"center\" width=\"200\">" +
                    "<a href=\"" + institution.url + "\">" +
                      "<img src=\"" + institution_logo + "\" alt=\"Marca da Ameciclo\" width=\"100\" style=\"display: block;\" />" +
                    "</a>" +
                  "</td>" +
                  "<td align=\"left\" style=\"color: #ffffff; font-family: Ubuntu, sans-serif; font-size: 24px; font-weight: 100; \">" +
                    month + " de " + year +
                  "</td>" +
                "</tr>" +
              "</table>" +
          "</td>" +
        "</tr>" +
        "<tr>" +
          "<td>" +
            "<table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"720\" style=\"border-collapse: collapse;\">" +
              "<tr>" +
                "<td bgcolor=\"#ffffff\" style=\"padding: 40px 30px 40px 30px;\">" +
                  getHtmlEvents(events, isPDF) +
                "</td>" +
              "</tr>" +
            "</table>" +
          "</td>" +
        "</tr>" + 
        "<tr>" +
          "<td bgcolor=\"#008080\" style=\"padding: 40px 40px 40px 40px;\">" +
            "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">" +
              "<tr>" +
                "<td style=\"padding-right:15px\" >" +
                  "<a href=\"" + institution.url + "\">" +
                    "<img src=\"" + getImageCoded(institution.logo) + "\" alt=\"Ameciclo\" height=\"50\" style=\"display: block;\" border=\"0\" />" +
                  "</a>" +
                "</td>" +
                "<td style=\"font-size: 0; line-height: 0;\" width=\"20\">" +
                  "&nbsp;" + 
                "</td>" +
                "<td width=\"75%\">" +  
                  "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">" +
                    "<tr>" +
                      "<td style=\"color: #ffffff; font-family: Ubuntu, sans-serif; font-size: 18px; font-weight: 100;\">" +
                        institution.full_name +
                      "</td>" +
                    "</tr>" +
                    "<tr>" +
                      "<td style=\"color: #ffffff; font-family: Ubuntu, sans-serif; font-size: 14px; font-weight: 100;\">" +
                        institution.address +
                      "</td>" +
                    "</tr>" +
                  "</table>" +
                "</td>" +
                "<td align=\"right\" style=\"padding:20px 0px 0px 0px\">" +
                  "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\">" +
                    "<tr>" +
                      getHtmlSocialMedia(social_media, isPDF) +
                    "</tr>" +
                  "</table>" +
                "</td>" +
              "</tr>" +    
            "</table>" +
          "</td>" +
        "</tr>" +
      "</table>" +
    "</body>"
}

function getHtmlEvents(events, isPDF = false) {
  let htmlEvents = ""
  events.forEach(e => htmlEvents += getHtmlEvent(e, isPDF))
  return htmlEvents
}

function getHtmlEvent(event, isPDF = false) {
  
  let title_font_size = 18
  if(event.getDescription().indexOf("DESTAQUE") >= 0) title_font_size = 26
  const contains_date = event.getDescription().indexOf("NODATE") >= 0
  let img = getImageUrlFromEvent(event)
  if (isPDF) img = getImageCoded(getImageUrlFromEvent(event))
  return "" +
  "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">" +
   "<tr>" +
     "<td align=\"justify\" style=\"color: #ff0000; font-family: Ubuntu, sans-serif; font-size: " + title_font_size + "px; font-weight: 400; padding:25px 0px 5px 0px\">" +
     getFormatedTitle(event) + 
    "</td>" +
   "</tr>" +
   "<tr>" +
    "<td width=\"260\" valign=\"top\" style=\"color: #153643; font-family: Ubuntu, sans-serif; font-size: 14px;\">" +
     "<table >" +
      "<tr style=\"padding: 20px 0 20px 0;\">" +
       "<td valign=\"top\">" +
           //"<img src='data:"+getImageCoded(getImageUrlFromEvent(event))+"' alt=\"Imagem do Evento\" style=\"float:left; width:260px; padding-right:20px\"/>" +
        "<img src=\""+ img + "\" alt=\"Imagem do Evento\" style=\"float:left; width:260px; padding-right:20px\">" +
       "</td>" +
       "<td align=\"justify\" valign=\"top\" style=\"font-family: Ubuntu, sans-serif;\">" +
        getFormatedDescription(event) +
       "</td>" +
      "</tr>" +
     "</table>" +
    "</td>" +
   "</tr>" +
   "<tr>" +
    "<td style=\"font-size: 0; line-height: 0;\" width=\"20\">" +
     "&nbsp;" +
    "</td>" +
   "</tr>" +
  "</table>"
}

function getFormatedTitle(event) {
  if (event.getStartTime().getDate() > 26) {
    const a = 1
  }
  let day = "Dia " + addZeroToInt(event.getStartTime().getDate()) + " - " 
  if(event.getDescription().indexOf("DESTAQUE") >= 0) day = ""
  return day + event.getTitle();
}

function getFormatedDescription(event) {
  let newDescription = event.getDescription().replace(/\n/g, "<br>");
  newDescription = newDescription.replace("DESTAQUE ","")
  const cutChar =  newDescription.indexOf("<br>");
  if (cutChar > 0) { 
        newDescription = newDescription.substring(0, cutChar);
  }
  return newDescription
}

/**
function getShortDescription(description) {
  let newDescription = description.replace(/\n/g, "<br>");
  const cutPlace =  newDescription.indexOf("<br>");
  if (cutPlace > 0) { 
        newDescription = description.substring(0, cutPlace);
  }
  return description
}
 */

function getHtmlSocialMedia(sm, isPDF = false) {
  let html = ""
  sm.forEach(s => {
    let img = s.logo
    if (isPDF) img = getImageCoded(s.logo)
    html += "" +
    "<td>" +
      "<a href=\"" + s.url + "\">" +
        "<img src=\"" + img + "\" alt=" + s.alt + " height=\"30\" style=\"display: block;\" border=\"0\" />" +
      "</a>" +
    "</td>" +
    "<td style=\"font-size: 0; line-height: 0\">" +
      "&nbsp;" + 
    "</td>"
  })
  return html
}