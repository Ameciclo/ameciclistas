function addZeroToInt(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  imageUrl?: string;
}

interface NewsletterPreviewProps {
  events: CalendarEvent[];
  subject: string;
}

export function NewsletterPreview({ events, subject }: NewsletterPreviewProps) {
  if (!events.length) {
    return (
      <div className="p-4 bg-gray-100 rounded text-center">
        Nenhum evento encontrado para o período
      </div>
    );
  }

  const firstEventDate = new Date(events[0].startTime);
  const month = getMonthName(firstEventDate);
  const year = firstEventDate.getFullYear();

  return (
    <div 
      className="border rounded-lg overflow-hidden bg-gray-50"
      style={{ 
        backgroundImage: 'url("/images/logo marca ameciclo - bg - pattern.svg")',
        backgroundRepeat: 'repeat'
      }}
    >
      <div className="text-white p-6" style={{ backgroundColor: '#008080' }}>
        <div className="flex items-center justify-between">
          <div className="text-right text-xl font-light">
            BOLETIM<br />INFORMATIVO
          </div>
          <div className="mx-8">
            <img 
              src="/images/apenas logo da ameciclo.svg" 
              alt="Logo da Ameciclo" 
              className="w-20 h-20"
            />
          </div>
          <div className="text-left text-xl font-light">
            {month} de {year}
          </div>
        </div>
      </div>

      <div className="p-8" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
        {events.map((event) => (
          <EventPreview key={event.id} event={event} />
        ))}
      </div>

      <div className="text-white p-6" style={{ backgroundColor: '#008080' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <img 
              src="/images/logo marca ameciclo.svg" 
              alt="Ameciclo" 
              className="w-12 h-12"
            />
            <div>
              <div className="text-lg font-light">
                Associação Metropolitana de Ciclistas do Recife
              </div>
              <div className="text-sm font-light">
                R. da Aurora, 529, loja 2 - Santo Amaro Recife/PE<br />
                CEP:50050-145 - Fone: +55 81 99786 0060
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <SocialIcon name="instagram" />
            <SocialIcon name="youtube" />
            <SocialIcon name="linkedin" />
            <SocialIcon name="telegram-app" />
            <SocialIcon name="whatsapp" />
            <SocialIcon name="github" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EventPreview({ event }: { event: CalendarEvent }) {
  const isHighlight = event.description.includes("DESTAQUE");
  const titleSize = isHighlight ? "text-2xl" : "text-lg";
  
  const eventDate = new Date(event.startTime);
  const day = event.description.includes("DESTAQUE") 
    ? "" 
    : `Dia ${addZeroToInt(eventDate.getDate())} - `;

  const imageUrl = event.imageUrl || "/images/event-placeholder.png";
  
  // Limpar HTML mas manter formatação básica
  const description = event.description
    .replace("DESTAQUE ", "")
    .replace("RECORRENTE ", "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .split('\n')[0] // Primeira linha apenas
    .trim();

  return (
    <div className="mb-8 last:mb-0">
      <h3 className={`text-red-600 font-semibold mb-2 ${titleSize}`}>
        {day}{event.title}
      </h3>
      
      <div className="flex space-x-5">
        <img 
          src={imageUrl}
          alt="Imagem do Evento"
          className="w-64 h-48 object-cover rounded"
        />
        <div 
          className="flex-1 text-sm text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    </div>
  );
}

function SocialIcon({ name }: { name: string }) {
  const urls: Record<string, string> = {
    "instagram": "http://www.instagram.com/Ameciclo",
    "youtube": "https://www.youtube.com/@ameciclo",
    "linkedin": "https://www.linkedin.com/company/ameciclo",
    "telegram-app": "https://t.me/s/ameciclo",
    "whatsapp": "https://wa.me/5581997860060?text=Ol%C3%A1,%20Ameciclo!",
    "github": "https://github.com/ameciclo"
  };

  return (
    <a href={urls[name]} target="_blank" rel="noopener noreferrer">
      <img 
        src={`/images/icons8-${name}-50.svg`}
        alt={`Logo ${name}`}
        className="w-8 h-8 opacity-80 hover:opacity-100 transition-opacity"
        style={{ filter: 'brightness(0) invert(1)' }}
      />
    </a>
  );
}

function getMonthName(date: Date): string {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return months[date.getMonth()];
}