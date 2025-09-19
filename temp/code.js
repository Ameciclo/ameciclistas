function doGet(e) {
  // TÍTULO
  const subject = getSubject()
  // EVENTOS

  const calendars_ids = getCalendars()
  const events = getDatedSortedEventsByCalendarsId(calendars_ids)

  const button = `<style>
      .button {
        border: none;
        color: white;
        padding: 20px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 20px;
        margin: 4px 2px;
        cursor: pointer;
        background-color: #008080;
      }
      button:hover{background-color:red;}
      button:focus{background-color:black;}
      .center {
        margin: auto;
        text-align: center;
        width: 50%;
        padding: 10px;
      } 
    </style>
  <body>
    <form class="center" id="form">
        <button type="submit" class="button" id="btn"> 
          TUDO CERTO, ENVIAR! 
          </button>
          <br>
        <label id="label">Senha: </label><input type="password" id="password">
    </form>
      <script>
        document.getElementById("btn").addEventListener("click",doStuff)
        function doStuff() {
          google.script.run.sendNewsletter(document.getElementById("password").value)
          document.getElementById("btn").remove()
          document.getElementById("password").remove()
          document.getElementById("label").remove()
          document.getElementById("form").remove()
        }
      </script>`

  const html = getNewsletterHtml(events) + button //
  return HtmlService.createHtmlOutput(html)
}

function hash(s) {
  return s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)
}

function sendNewsletter(password) {
  if(hash(password) == '1463613993') prod()
}