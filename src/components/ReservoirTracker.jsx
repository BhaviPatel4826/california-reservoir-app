import React, { useState, useEffect } from 'react'
import SelectReservoir from './SelectReservoir'
import ReservoirInfo from './ReservoirInfo';
import Navbar from './Navbar';


const ReservoirTracker = () => {

 
 
  const [currCounty, setCurrCounty] = useState('');
  const [currReservoir, setCurrReservoir] = useState('');
  const [countyList, setCountyList] = useState([]);

  useEffect(() => {
           
             const fetchAllCounties = async () => {
               try {
                 const res = await fetch(
                   'https://corsproxy.io/?https://cdec.water.ca.gov/CDECStationServices/CDecServlet/getCounty'
                 );
       
                 const response = await res.json();
                 let result = {};
                  response.result.forEach(c => {
                    result[parseInt(c.COUNTY_NUM, 10)] =
                      c.COUNTY_NAME.charAt(0).toUpperCase() + c.COUNTY_NAME.slice(1).toLowerCase();
                  });
                console.log(result);
                 setCountyList(result);
               } catch (err) {
                 console.error("Error fetching all counties:", err);
               }
             }
             fetchAllCounties();
            },[]);
  


  return (
    <div
    className="min-h-screen min-w-screen p-8 transition-colors duration-500
         bg-blue-500 to-white text-gray-900 flex flex-col items-center justify-start"
      >
       <Navbar />
        <div className='w-[100%] flex items-start justify-center gap-4'>
          <SelectReservoir 
            currCounty={currCounty}
            setCurrCounty={setCurrCounty}
            setCurrReservoir={setCurrReservoir}
          />
          <ReservoirInfo currReservoir={currReservoir} setCurrReservoir={setCurrReservoir} countyList={countyList}/>
       </div>

    </div>
  )
}


export default ReservoirTracker
