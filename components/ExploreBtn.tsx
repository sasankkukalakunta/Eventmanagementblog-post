'use client';

import EventCard from "./EventCard";

 const ExploreBtn = () => {
  return (
    <div>
        <button type ="button" id="explore-btn"  className="mt-7 mx-auto" onClick={() => console.log('Explore button clicked')}>
            <a href={"#events"}>
                Explore Events
            </a>
        </button>
    </div>
  )
}

export default ExploreBtn;