import { Minus } from 'lucide-react';
import React from 'react'

const Loading = () => {
  return (
    <div className='flex justify-center items-center mt-32'>
      <Minus className='animate-spin mr-2' /> Please wait...
    </div>
  );
}

export default Loading