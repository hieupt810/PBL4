"use client";
import { failPopUp } from "@/hook/features/PopupSlice";
import { getToken } from "@/hook/features/TokenSlice";
import { useAppDispatch, useAppSelector } from "@/hook/hook";
import {
  Button,
  Card,
  CardBody,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { RiDeleteBin5Line, RiEditBoxLine } from "react-icons/ri";

interface Home {
  first_name: string;
  last_name: string;
  username: string;
  id: string;
}

export default function Admin() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.tokenReducer.token);

  const [homes, setHomes] = useState<Home[]>([]);
  const [homesPage, setHomesPage] = useState(1);
  const [homesAmount, setHomesAmount] = useState(1);

  useEffect(() => {
    dispatch(getToken());
  }, [dispatch]);

  useEffect(() => {
    if (!token) return;

    fetch(
      process.env.BACKEND_URL +
        `api/home/list-home?token=${token}&page=${homesPage}`,
      { method: "GET" }
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.status === 200) {
          setHomes(d.homes);
          setHomesAmount(Math.floor(d.amount / 10) + 1);
        } else dispatch(failPopUp(d.message));
      });
  }, [dispatch, homesPage, token]);

  return (
    <div className="text-black/90 text-base font-normal font-sans w-[1440px] mx-auto">
      <div className="flex w-full flex-col">
        <Tabs aria-label="Options">
          <Tab key="homes" title="Nhà">
            <Card>
              <CardBody>
                <div className="flex flex-row items-center justify-between mb-4">
                  <h5 className="font-bold text-xl">
                    Danh sách nhà trong hệ thống
                  </h5>

                  <div className="flex flex-row items-center justify-end space-x-4 px-4">
                    <Button
                      isIconOnly
                      color="default"
                      onClick={() => {
                        setHomesPage(homesPage - 1 >= 1 ? homesPage - 1 : 1);
                      }}
                    >
                      <BiChevronLeft size={25} />
                    </Button>

                    <span>
                      Trang {homesPage} trên {homesAmount}
                    </span>

                    <Button
                      isIconOnly
                      color="default"
                      onClick={() => {
                        setHomesPage(
                          homesPage + 1 <= homesAmount
                            ? homesPage + 1
                            : homesAmount
                        );
                      }}
                    >
                      <BiChevronRight size={25} />
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableColumn>STT</TableColumn>
                    <TableColumn>ID nhà</TableColumn>
                    <TableColumn>Chủ nhà</TableColumn>
                    <TableColumn>Chức năng</TableColumn>
                  </TableHeader>

                  <TableBody>
                    {homes.map((value, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            {(homesPage - 1) * 10 + index + 1}
                          </TableCell>
                          <TableCell>{value.id}</TableCell>
                          <TableCell>
                            <div className="flex flex-col items-start justify-start">
                              <span className="font-semibold">
                                {value.last_name} {value.first_name}
                              </span>
                              <span className="text-gray-400 text-sm">
                                @{value.username}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-row items-center justify-start space-x-4">
                              <Button isIconOnly color="primary">
                                <RiEditBoxLine size={20} />
                              </Button>

                              <Button isIconOnly color="danger">
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
          </Tab>

          <Tab key="users" title="Người dùng"></Tab>
        </Tabs>
      </div>
    </div>
  );
}
