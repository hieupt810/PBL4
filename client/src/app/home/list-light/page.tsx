// LightList.tsx
import React from 'react';
import LightComponent from '@/components/LightComponent';
import { Light } from '@/app/types/light.type';


interface LightListProps {
  lights: Light[];
}

const LightList: React.FC<LightListProps> = ({ lights }) => {
  return (
    <>
      {lights.map((light) => (
        <LightComponent key={light.id} name={light.name} id={light.id} />
      ))}
    </>
  );
};

export default LightList;
