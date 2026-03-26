import React, { useState } from "react";
import UserTable from "./UserTable";
import UserDrawer from "./UserDrawer";

const dummyUsers = [
  { id: "1", name: "Kishan", email: "kishan@gmail.com", status: "active" },
  { id: "2", name: "Rahul", email: "rahul@gmail.com", status: "banned" },
  { id: "3", name: "Amit", email: "amit@gmail.com", status: "suspended" },
];

const UsersPage = () => {
  // Drawer state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Bulk selection state
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Handle row click → open drawer
  const handleRowClick = (user) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen p-5 text-white bg-slate-950">
      <h1 className="mb-5 text-2xl font-bold">Users</h1>

      <UserTable
        users={dummyUsers}
        onRowClick={handleRowClick}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
      />

      {/* Drawer */}
      <UserDrawer
        users={selectedUser}
        isOpen={isDrawerOpen}
        selectedUser={selectedUser}
        isClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

export default UsersPage;
