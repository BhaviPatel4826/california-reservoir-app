import React, { useState, useEffect } from 'react'
import SelectCounty from './SelectCounty'
import ReservoirInfo from './ReservoirInfo';


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
         bg-blue-500 to-white text-gray-900 flex flex-col items-center justify-center"
      >
       <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6 relative">
                <h1 className="text-4xl font-bold text-center w-full text-white drop-shadow-sm">
                  California Reservoir Tracker
                </h1>
               
              </div>
        </div>
        <div className='flex'>
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
