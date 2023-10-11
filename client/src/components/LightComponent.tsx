import React from 'react';
import { MdOutlineLight } from 'react-icons/md';
import { BsLightbulb, BsLightbulbOff } from 'react-icons/bs';

interface LightType {
  name: string;
}

export default function LightComponent({name}: LightType) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg shadow-xl">
        <MdOutlineLight className="mr-2.5" size={30} />

        <p className="mx-2.5 flex-grow font-sans">
            {name}
        </p>

        <div className="flex space-x-3.5">
            <BsLightbulb size={24} className="text--500" />
            <BsLightbulbOff size={24} className="text-red-500" />
        </div>
    </div>
  );
}
