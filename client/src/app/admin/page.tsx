"use client";
import { resetLoading, setLoading } from "@/hook/features/LoadingSlice";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { getToken } from "@/hook/features/TokenSlice";
import { useAppDispatch, useAppSelector } from "@/hook/hook";
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
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
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
  const loading = useAppSelector((state) => state.loadingReducer.onLoading);

  const [homes, setHomes] = useState<Home[]>([]);
  const [homesPage, setHomesPage] = useState(1);
  const [homesAmount, setHomesAmount] = useState(1);

  const [users, setUsers] = useState<Member[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersAmount, setUsersAmount] = useState(1);

  useEffect(() => {
    dispatch(getToken());
  }, [dispatch]);

  useEffect(() => {
    if (!token) return;

    fetch(
      `${process.env.BACKEND_URL}api/home/list-home?token=${token}&page=${homesPage}`,
      { method: "GET" }
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.status === 200) {
          setHomes(d.homes);
          setHomesAmount(Math.floor(d.amount / 10) + 1);
        } else dispatch(failPopUp(d.message));
      });

    fetch(
      `${process.env.BACKEND_URL}api/user/list-user?token=${token}&page=${homesPage}`,
      { method: "GET" }
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.status === 200) {
          setUsers(d.users);
          setUsersAmount(Math.floor(d.amount / 10) + 1);
        } else dispatch(failPopUp(d.message));
      });
  }, [dispatch, homesPage, token, loading]);

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
                    <Button isIconOnly color="success">
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
          </Tab>

          <Tab key="users" title="Người dùng">
            <Card>
              <CardBody>
                <div className="flex flex-row items-center justify-between mb-4">
                  <h5 className="font-bold text-xl">
                    Danh sách người dùng trong hệ thống
                  </h5>
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
                        page={usersPage}
                        total={usersAmount}
                        onChange={(page) => setUsersPage(page)}
                      />
                    </div>
                  }
                >
                  <TableHeader>
                    <TableColumn>STT</TableColumn>
                    <TableColumn>Tên đăng nhập</TableColumn>
                    <TableColumn>Họ</TableColumn>
                    <TableColumn>Tên</TableColumn>
                    <TableColumn>Giới tính</TableColumn>
                    <TableColumn>Quyền hạn</TableColumn>
                    <TableColumn>Cập nhật lần cuối</TableColumn>
                    <TableColumn>Chức năng</TableColumn>
                  </TableHeader>

                  <TableBody>
                    {users.map((value, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            {(usersPage - 1) * 10 + index + 1}
                          </TableCell>
                          <TableCell>{value.username}</TableCell>
                          <TableCell>{value.last_name}</TableCell>
                          <TableCell>{value.first_name}</TableCell>
                          <TableCell>
                            {value.gender == 0 ? "Nam" : "Nữ"}
                          </TableCell>
                          <TableCell>
                            {value.role == 0 ? "Người dùng" : null}
                            {value.role == 1 ? "Quản trị viên" : null}
                            {value.role == 2 ? "Quản trị hệ thống" : null}
                          </TableCell>
                          <TableCell>{value.updated_at}</TableCell>
                          <TableCell>
                            <div className="flex flex-row items-center justify-start space-x-4">
                              <Button isIconOnly color="primary">
                                <RiEditBoxLine size={20} />
                              </Button>

                              <Button
                                isIconOnly
                                color="danger"
                                isLoading={loading}
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
                                  fetch(`${process.env.BACKEND_URL}api/user`, {
                                    method: "DELETE",
                                    headers: headers,
                                    body: JSON.stringify({
                                      username: value.username,
                                    }),
                                  })
                                    .then((r) => r.json())
                                    .then((d) => {
                                      if (d.status === 200) {
                                        dispatch(successPopUp(d.message));
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
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
