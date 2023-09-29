import Man from "@/static/man.jpg";
import Woman from "@/static/woman.png";
import Image from "next/image";
import { BsArrowRightShort } from "react-icons/bs";
import { FaTemperatureFull } from "react-icons/fa6";
import { WiHumidity } from "react-icons/wi";
import styles from "./home.module.css";

export default function HomeInformation() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h5>Thiết bị của tôi</h5>

        <div className={styles.items_container}>
          <div className={`${styles.item} bg-[#7443eb]`}>
            <div className={styles.item_icon}>
              <FaTemperatureFull size={30} />
              <BsArrowRightShort size={25} />
            </div>

            <div className={styles.item_name}>
              <span>Nhiệt độ</span>
            </div>
          </div>

          <div className={`${styles.item} bg-[#edc74c]`}>
            <div className={styles.item_icon}>
              <WiHumidity size={30} />
              <BsArrowRightShort size={25} />
            </div>

            <div className={styles.item_name}>
              <span>Độ ẩm</span>
            </div>
          </div>

          <div className={`${styles.item} bg-[#f0966b]`}>
            <div className={styles.item_icon}>
              <FaTemperatureFull size={30} />
              <BsArrowRightShort size={25} />
            </div>

            <div className={styles.item_name}>
              <span>Waiting...</span>
            </div>
          </div>

          <div className={`${styles.item} bg-[#68c8e4]`}>
            <div className={styles.item_icon}>
              <FaTemperatureFull size={30} />
              <BsArrowRightShort size={25} />
            </div>

            <div className={styles.item_name}>
              <span>Waiting...</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.title}>
          <h5>Thành viên</h5>
          <div>
            <BsArrowRightShort size={25} />
          </div>
        </div>

        <div className={styles.members}>
          <div className={styles.member}>
            <Image src={Woman} alt={"Avatar"} className={styles.avatar} />
            <h5>Name</h5>
            <h4>Role</h4>
          </div>

          <div className={styles.member}>
            <Image src={Man} alt={"Avatar"} className={styles.avatar} />
            <h5>Name</h5>
            <h4>Role</h4>
          </div>
        </div>
      </div>
    </main>
  );
}
