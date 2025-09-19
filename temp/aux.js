function sendEmail(email, subject, html) {
  MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: html
    });
}

function htmlToPDF(html, name) {
  //const blob = HtmlService.createHtmlOutput(html);
  const blob = Utilities.newBlob(html, MimeType.HTML, "text.html");
  const pdf = blob.getAs(MimeType.PDF);
  const file = DriveApp.createFile(pdf).setName(name + ".pdf");
  const folder = DriveApp.getFolderById(getNewsletterFolder())
  file.moveTo(folder)
}

function getImageCoded(url) {
  const img = UrlFetchApp.fetch(url)
  const coded = img.getBlob().getContentType()+';base64,'+ Utilities.base64Encode(img.getBlob().getBytes())
  return "data:" + coded
}

function getMonthsNameByDate(date) {
  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
    ]
  return meses[date.getMonth()]
}

function addZeroToInt(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}


function getDirectDriveImageUrl(fileId) {
  return "https://lh3.googleusercontent.com/d/" + fileId + "=w260-h200";
}

function getImageUrlFromEvent(event) {
  const base = "https://lh3.googleusercontent.com/d/"
  //const base = "https://drive.google.com/uc?export=view&id="
  let imageId = "14YQ_-vuku_wxN_Q2saSl87VJ6yEKs89Z" // placeholder
  const id = event.getId().replace("@google.com","");
  var res = Calendar.Events.get(event.getOriginalCalendarId(), id, {fields: "attachments/fileId"});
  if (res.attachments !== undefined) imageId = res.attachments.map(function(e){return e.fileId})[0]
  return base + imageId + "=w260-h200"
}

function getFirstAndLastMonthDays() {
  const today = new Date()
  const last_day = new Date()
  last_day.setDate(1)
  last_day.setHours(-1)
  return {
    first_day: new Date(today.getFullYear(), today.getMonth() - 1, 1),
    last_day: last_day
  }
}

// PREPARAR AQUI O EVENTO QUE PASSA
function getDatedSortedEventsByCalendarsId(ids) {
  const date = getFirstAndLastMonthDays() 
  let events = []
  /**   */
  ids.forEach(id => {
    const cs = CalendarApp.getCalendarById(id)
    const es = cs.getEvents(date.first_day, date.last_day)
    es.forEach(e => events.push(e))
    })
  events = events.filter(e => e.getDescription().indexOf("RECORRENTE") < 0)
  events.sort((a,b) => a.getStartTime() - b.getStartTime())

  // ONE EVENT JUST TO TESTS
  // events.push(CalendarApp.getCalendarById(ids[0]).getEvents(date.first_day, date.last_day)[0])
  return events
}

function saveImages(events) {

}

function renameAndMove(idArquivo, nomeArquivo) {
  
  var idPastaPadrao = "1f1raA2S5hvzn8vw_EWciBaDq6ZGBd2NH";
  
  var mesAno = nomeArquivo.substring(0, 7);
  var arquivo = DriveApp.getFileById(idArquivo);
  var pasta = DriveApp.getFolderById(idPastaPadrao);
  var pastaMesI = pasta.getFoldersByName(mesAno);
  var pastaMes
  if (pastaMesI.hasNext()){
    pastaMes = pastaMesI.next();
  } else {
    pastaMes = pasta.createFolder(mesAno);
  }

  var novoArquivo = arquivo
  var pastaArquivoOndeTa = arquivo.getParents();
  var ondeTa = ""
  if (pastaArquivoOndeTa.hasNext()) { ondeTa = pastaArquivoOndeTa.next().getName() }
  if (ondeTa != mesAno) {
    novoArquivo = arquivo.makeCopy(pastaMes);
    novoArquivo.setName("Boletim Informativo - " + nomeArquivo);
    novoArquivo.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW)
  }
//  var pastasArquivo = arquivo.getParents();
//  var pastaEstudada;
//  while (pastasArquivo.hasNext()) {
//    pastaEstudada = pastasArquivo.next();
//    if (pastaEstudada.getId() != pastaMes.getId())
//      pastaEstudada.removeFile(arquivo)
//      }
  return novoArquivo.getId()
}
