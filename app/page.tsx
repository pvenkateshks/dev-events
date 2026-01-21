import ExploreBtn from '@/component/ExploreBtn'
import EventCard from '@/component/EventCard'
import React from 'react' 
import {IEvent} from "@/database";


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const next_ = BASE_URL + '/api/events';

   const page = async () => {

    const response = await fetch(next_)
    const {events} = await response.json();

  return (
    <section>
      <h1 className='text-center'> The Hub for Every Dev Event<br/> Event You Can't Miss </h1>
      <p className="text-center mt-5"> Hackathons, Meetups and Confereneces All in One Place</p>
      <ExploreBtn />

      <div className = "mt-20 space-y-10">
        <h3>Featured Events</h3>
        <ul className='events'>
            {events && events.length>0 &&  events.map((event:IEvent) => 
            (<li key={event.title}><EventCard {...event} /></li>
            ))}</ul>

    </div>
    </section>
  )
}

export default page
