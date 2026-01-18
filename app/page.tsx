import ExploreBtn from '@/component/ExploreBtn'
import events from '@/lib/constants';
import EventCard from '@/component/EventCard'
import React from 'react' 


   const page = () => {
  return (
    <section>
      <h1 className='text-center'> The Hub for Every Dev Event<br/> Event You Can't Miss </h1>
      <p className="text-center mt-5"> Hackathons, Meetups and Confereneces All in One Place</p>
      <ExploreBtn />

      <div className = "mt-20 space-y-10">
        <h3>Featured Events</h3>
        <ul className='events'>
            {events.map((event) => 
            (<li key={event.title}><EventCard {...event} /></li>
            ))}</ul>

    </div>
    </section>
  )
}

export default page
