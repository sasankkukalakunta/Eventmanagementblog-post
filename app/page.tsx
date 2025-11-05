import EventCard from "@/components/EventCard";
import { ExploreBtn } from "@/components/ExploreBtn";
import Image from "next/image"; 
import { title } from "process";
import { events } from "@/lib/constants";

export default function Home() {
  return (
    <section >
      <h1 className="text-center">The Hub For Every Dev <br />
      Event You Can't Miss</h1>
      <p className="text-center mt-5">Hackthons,Meetups and Conferences, All in One Place.
        <br />
        Stay tuned for updates!
      </p>
      <ExploreBtn />
      <div className="mt-20 space-y-7">
        <h3> Featured Events</h3>

        <ul className="events list-none pl-0">
          {events.map((event) => (
            <li key={event.title}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}