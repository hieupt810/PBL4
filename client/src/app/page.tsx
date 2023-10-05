import { TbAirConditioning } from "react-icons/tb";
import { Block_Devices } from "@/components/Block_Devices";

export default function Home() {
  return (
    <main>
      <Block_Devices
        name="Air Condition"
        backgroundColor="purple"
        Icon={<TbAirConditioning size={24} />}
      />
    </main>
  );
}
