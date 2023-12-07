"use client";
import { resetLoading, setLoading } from "@/hook/features/LoadingSlice";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch } from "@/hook/hook";
import { Member } from "@/models/member";
import {
  Button,
  Card,
  CardBody,
  Pagination,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
} from "@nextui-org/react";
import { getCookie, hasCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { RiDeleteBin5Line, RiEditBoxLine } from "react-icons/ri";
import AdminLayout from "../layout";
import { useRouter, useSearchParams } from "next/navigation";
import http from "@/app/utils/http";

interface Device {
  id: string;
  name: string;
  pin: number;
  device: string;
}

export default function Admin() {
  const dispatch = useAppDispatch();

  const [refetch, setRefetch] = useState(false);

  const [devices, setDevices] = useState<Device[]>([]);
  const deviceList = Array.isArray(devices) ? devices : [];
  console.log(devices)
  const [homesPage, setHomesPage] = useState(1);
  const [homesAmount, setHomesAmount] = useState(1);


  const params = useSearchParams();

  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      if (!hasCookie("token")) return;
      const token = getCookie("token")?.toString();
      try {
        const response = await http.get(`api/home/${params.get("id")}/getAllDevice`, {
          headers: {
            token: `${token}`,
          },
        });

        if (response.data.code === 200) {
          
          setDevices(response.data.data);
          console.log(response.data.data);
          setHomesAmount(Math.floor(response.data.amount / 10) + 1);
        } else {
          dispatch(failPopUp(response.data.message));
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }

    fetchData();
  }, [dispatch, homesPage, refetch, params]);

  return (
    <AdminLayout>
      <div className="text-black/90 text-base font-normal font-sans w-[1440px] mx-auto">
        <div className="flex w-full flex-col">
          <Card className="mt-10">
            <CardBody>
              <div className="flex flex-row items-center justify-between mb-4">
                <h5 className="font-bold text-xl">
                  Danh sách thiết bị trong nhà của {params.get("id")}
                </h5>

                <div className="flex flex-row items-center justify-end space-x-4 px-4">
                  <Button
                    isIconOnly
                    color="success"
                    onClick={() => router.push(`/admin/add-device?id=${params.get("id")}`)}
                  >
                    <BiPlus size={25} />
                  </Button>
                </div>
              </div>

              <Table
                removeWrapper
                color="primary"
                selectionMode="single"
                bottomContent={
                  <div className="flex w-full justify-center">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="secondary"
                      page={homesPage}
                      total={homesAmount}
                      onChange={(page) => setHomesPage(page)}
                    />
                  </div>
                }
              >
                <TableHeader>
                  <TableColumn>STT</TableColumn>
                  <TableColumn>ID</TableColumn>
                  <TableColumn>Device</TableColumn>
                  <TableColumn>Name</TableColumn>
                  <TableColumn>Pin</TableColumn>
                  <TableColumn>Chức năng</TableColumn>
                </TableHeader>

                <TableBody>
                  {deviceList?.map((value, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          {(homesPage - 1) * 10 + index + 1}
                        </TableCell>
                        <TableCell>{value.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col items-start justify-start">
                            <span className="font-semibold">{value.device}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col items-start justify-start">
                            <span className="font-semibold">{value.name}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col items-start justify-start">
                            <span className="font-semibold">{value.pin}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-row items-center justify-start space-x-4">
                            
                            <Button
                              isIconOnly
                              color="danger"
                              onClick={() => {
                                dispatch(setLoading());
                                const headers: Headers = new Headers();
                                headers.append("Accept", "application/json");
                                headers.append(
                                  "Content-Type",
                                  "application/json"
                                );
                                headers.append(
                                  "token",
                                  getCookie("token") as string
                                );
                                fetch(
                                  `${process.env.BACKEND_URL}api/home/delete-home`,
                                  {
                                    method: "DELETE",
                                    headers: headers,
                                    body: JSON.stringify({
                                      id: value.id,
                                    }),
                                  }
                                )
                                  .then((r) => r.json())
                                  .then((d) => {
                                    if (d.status === 200) {
                                      dispatch(successPopUp(d.message));
                                      setRefetch(!refetch);
                                    } else dispatch(failPopUp(d.message));
                                    dispatch(resetLoading());
                                  });
                              }}
                            >
                              <RiDeleteBin5Line size={20} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
