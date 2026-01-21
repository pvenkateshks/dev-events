import { notFound } from "next/navigation";
import Image from "next/image";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailsItem = ({icon, alt, label}: {icon: string; label: string; alt: string}) => (

    <div className="flex flex-row gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
)

const EventAgendaItem = ({agendaItems}: {agendaItems: string[]}) => (
    <ul>
        {agendaItems.map((item, index) => (<li key={index}>{item}</li>))}
    </ul>
)

const EventTages = ({tags}: {tags: string[]}) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag, index) => (<div key={tag} className="pill">{tag}</div>))}
    </div>
)

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const request = await fetch(`${BASE_URL}/api/events/${slug}`);
  const {event:{description,    venue, time ,date, image, overview, location, mode, agenda, audience, tags, organizer}} = await request.json();

  if (!description) {
    return notFound();
  }
  return (
   <section id="event">
    <div className="header">
       <h1> Event Description</h1>
       <p>{description}</p>
    </div>
    <div className="details">
      {/* Left side - Event Image */}
      <div className="content">
       <Image src={image} alt="Event Banner" className="event-image" width={800} height={800} />
        <section className="flex-col-gap-2">
        <h2>Overview</h2>
        <p>{overview}</p>

        </section>

        <section className="flex-col-gap-2">
        <h2>Event Details</h2>

          <EventDetailsItem icon="/icons/calendar.svg" alt="Date" label={date} />
          <EventDetailsItem icon="/icons/clock.svg" alt="Time" label={time} />
          <EventDetailsItem icon="/icons/pin.svg" alt="Location" label={location} />
          <EventDetailsItem icon="/icons/mode.svg" alt="Venue" label={venue} />
        </section>

        <section className="flex-col-gap-2">
        <div>
        <h2>Agenda</h2>
        <EventAgendaItem agendaItems={JSON.parse(agenda[0])} />
        </div>
        </section>

        <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>  
            <p>{organizer}</p> 
        </section>

        <EventTages tags={JSON.parse(tags[0])} />


      </div>
      {/*Right side for form */
     }
     <aside className="booking">
        <p className="text-lg font-semibold">Book Event</p>
     </aside>

    </div>
   
   
   </section>

  )
}

export default EventDetailsPage
