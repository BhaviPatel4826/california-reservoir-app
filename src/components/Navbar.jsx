import React from 'react'

const Navbar = () => {
  return (
    <div className= "w-[90%] h-[100px] flex items-center justify-between">
        <div className="flex-col justify-between items-center mb-6 relative">
        <h1 className="text-4xl font-bold text-center w-full text-white drop-shadow-sm">
            California Reservoir Water Level Tracker
        </h1>
        <h3 className='text-white text-2xl'> Real-time reservior monitoring</h3> 
        </div>

        <div className='text-xl w-[10%] text-white flex items-center justify-between'>
            <ul>Home</ul>
            <ul>About</ul>
        </div>
    </div>
  )
}

export default Navbar
