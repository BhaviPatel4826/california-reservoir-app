import React, { useState, useEffect } from 'react'
import SelectCounty from './SelectCounty'
import ReservoirInfo from './ReservoirInfo';
import Navbar from './Navbar';


const ReservoirTracker = () => {

 
 
  const [currCounty, setCurrCounty] = useState('');
  const [currReservoir, setCurrReservoir] = useState('');
 
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("ORO");
  const [granularity, setGranularity] = useState("month");
  const [darkMode, setDarkMode] = useState(false);
  const [allStationMeta, setAllStationMeta] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [pendingQuery, setPendingQuery] = useState("ORO");


  


  return (
    <div
    className="min-h-screen min-w-screen p-8 transition-colors duration-500
         bg-blue-500 to-white text-gray-900 flex flex-col items-center justify-start"
      >
       <Navbar />
        <div className='w-[100%] flex items-start justify-center gap-4'>
          <SelectCounty 
            currCounty={currCounty}
            setCurrCounty={setCurrCounty}
            setCurrReservoir={setCurrReservoir}
          />
          <ReservoirInfo currReservoir={currReservoir} setCurrReservoir={setCurrReservoir}/>
       </div>

    </div>
  )
}


export default ReservoirTracker
