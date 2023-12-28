"use client";
import http from "@/app/utils/http";
import { resetLoading, setLoading } from "@/hook/features/LoadingSlice";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch } from "@/hook/hook";
import {
  Button,
  Card,
  CardBody,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { getCookie, hasCookie } from "cookies-next";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { RiDeleteBin5Line } from "react-icons/ri";
import AdminLayout from "../layout";

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
  const [homesPage, setHomesPage] = useState(1);
  const [homesAmount, setHomesAmount] = useState(1);

  const params = useSearchParams();

  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      if (!hasCookie("token")) return;
      const token = getCookie("token")?.toString();
      try {
        const response = await http.get(
          `api/home/${params.get("id")}/getAllDevice`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.data.code === 200) {
          setDevices(response.data.data);
          response.data.data;
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
      <div className="text-black/90 text-base font-normal font-sans">
        <div className="flex w-full flex-col">
          <Card className="mt-10">
            <CardBody>
              <div className="flex flex-row items-center justify-between mb-4">
                <h5 className="font-bold text-xl">
                  Danh sách thiết bị trong nhà
                </h5>

                <div className="flex flex-row items-center justify-end space-x-4 px-4">
                  <Button
                    isIconOnly
                    color="success"
                    onClick={() =>
                      router.push(`/admin/add-device?id=${params.get("id")}`)
                    }
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
                        <TableCell>
                          <div className="flex flex-col items-start justify-start">
                            <span className="font-semibold">
                              {value.device}
                            </span>
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
                                  "Authorization",
                                  getCookie("token") as string
                                );

                                let deleteApiUrl = "";

                                // Kiểm tra loại thiết bị và xây dựng URL tương ứng
                                if (value.device === "led") {
                                  deleteApiUrl = `${process.env.BACKEND_URL}api/led/${value.id}/delete`;
                                } else {
                                  deleteApiUrl = `${process.env.BACKEND_URL}api/ir/delete/${value.id}`;
                                }

                                fetch(deleteApiUrl, {
                                  method: "DELETE",
                                  headers: headers,
                                })
                                  .then((r) => r.json())
                                  .then((d) => {
                                    if (d.code === 200) {
                                      dispatch(successPopUp(d.message));
                                      setRefetch(!refetch);
                                    } else {
                                      dispatch(failPopUp(d.message));
                                    }
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
