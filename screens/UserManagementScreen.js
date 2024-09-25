import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { getUsers, addUser, updateUser, deleteUser } from '../api/userService';
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';

const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAddUser = async (userData) => {
    setLoading(true);
    try {
      await addUser(userData);
      // Cập nhật danh sách người dùng
      setUsers((prevUsers) => [
        ...prevUsers,
        {
          id: Date.now().toString(), // Hoặc bạn có thể lấy ID từ phản hồi của Firebase nếu có
          name: { stringValue: userData.name },
          email: { stringValue: userData.email },
          age: { integerValue: userData.age },
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (id, updatedData) => {
    setLoading(true);
    try {
      await updateUser(id, updatedData);
      setUsers(users.map(user => (user.id === id ? updatedData : user)));
      setEditingUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    setLoading(true);
    try {
      await deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {error && <Text>Error: {error}</Text>}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <UserForm onSubmit={editingUser ? (data) => handleUpdateUser(editingUser.id, data) : handleAddUser} initialData={editingUser} />
          <UserList users={users} onEdit={setEditingUser} onDelete={handleDeleteUser} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default UserManagementScreen;
