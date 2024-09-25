import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const BASE_URL = 'https://firestore.googleapis.com/v1/projects/loc1-5e841/databases/(default)/documents/users';

const UserForm = ({ onSubmit, initialData }) => {
  const [name, setName] = useState(initialData ? initialData.name : '');
  const [email, setEmail] = useState(initialData ? initialData.email : '');
  const [age, setAge] = useState(initialData ? initialData.age.toString() : '');

  const handleSubmit = () => {
    if (!name || !email || !age) {
      Toast.show({
        text1: 'Thông báo',
        text2: 'Vui lòng điền đầy đủ thông tin.',
        type: 'error',
        textStyle: styles.toastText,
        visibilityTime: 5000,
      });
      return;
    }
    if (name.length < 6) {
      Toast.show({
        text1: 'Thông báo',
        text2: 'Tên phải có ít nhất 6 ký tự.',
        type: 'error',
        textStyle: styles.toastText,
        visibilityTime: 5000,
      });
      return;
    }
    if (isNaN(age) || age < 0 || age > 120) {
      Toast.show({
        text1: 'Thông báo',
        text2: 'Tuổi phải là một số từ 0 đến 120.',
        type: 'error',
        textStyle: styles.toastText,
        visibilityTime: 5000,
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        text1: 'Thông báo',
        text2: 'Email không hợp lệ.',
        type: 'error',
        textStyle: styles.toastText,
        visibilityTime: 5000,
      });
      return;
    }

    onSubmit({ name, email, age: parseInt(age) });
    setName('');
    setEmail('');
    setAge('');
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setAge(initialData.age.toString());
    } else {
      setName('');
      setEmail('');
      setAge('');
    }
  }, [initialData]);

  return (
    <View style={styles.formContainer}>
      <Text style={styles.label}>Tên</Text>
      <TextInput
        placeholder="Nhập tên"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="Nhập email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <Text style={styles.label}>Tuổi</Text>
      <TextInput
        placeholder="Nhập tuổi"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title={initialData ? "Cập nhật người dùng" : "Thêm người dùng"} onPress={handleSubmit} color="#007BFF" />
    </View>
  );
};

const App = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}?list`);
      if (response.data && response.data.documents) {
        const fetchedUsers = response.data.documents.map(doc => ({
          id: doc.name.split('/').pop(),
          name: doc.fields.name.stringValue,
          email: doc.fields.email.stringValue,
          age: doc.fields.age.integerValue,
        }));
        setUsers(fetchedUsers);
      } else {
        console.warn('Không có dữ liệu người dùng');
        setUsers([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu người dùng', error);
      Toast.show({
        text1: 'Lỗi',
        text2: 'Không thể tải danh sách người dùng!',
        type: 'error',
        textStyle: styles.toastText,
        visibilityTime: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData) => {
    try {
      const response = await axios.post(BASE_URL, {
        fields: {
          name: { stringValue: userData.name },
          email: { stringValue: userData.email },
          age: { integerValue: userData.age },
        },
      });
      const newUser = {
        id: response.data.name.split('/').pop(),
        name: userData.name,
        email: userData.email,
        age: userData.age,
      };
      setUsers((prevUsers) => [...prevUsers, newUser]);
      Toast.show({
        text1: 'Thành công',
        text2: 'Đã thêm người dùng mới!',
        textStyle: styles.toastText,
        visibilityTime: 5000,
      });
    } catch (error) {
      console.error('Lỗi khi thêm người dùng', error);
      Toast.show({
        text1: 'Lỗi',
        text2: 'Không thể thêm người dùng!',
        type: 'error',
        textStyle: styles.toastText,
        visibilityTime: 5000,
      });
    }
  };

  const updateUser = async (userData) => {
    try {
      await axios.patch(`${BASE_URL}/${editingUser.id}`, {
        fields: {
          name: { stringValue: userData.name },
          email: { stringValue: userData.email },
          age: { integerValue: userData.age },
        },
      });
      setUsers(prevUsers =>
        prevUsers.map(user => (user.id === editingUser.id ? { ...user, ...userData } : user))
      );
      setEditingUser(null);
      Toast.show({
        text1: 'Thành công',
        text2: 'Đã cập nhật thông tin người dùng!',
        textStyle: styles.toastText,
        visibilityTime: 5000,
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật người dùng', error);
      Toast.show({
        text1: 'Lỗi',
        text2: 'Không thể cập nhật người dùng!',
        type: 'error',
        textStyle: styles.toastText,
        visibilityTime: 5000,
      });
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      setUsers((prevUsers) => prevUsers.filter(user => user.id !== id));
      Toast.show({
        text1: 'Thành công',
        text2: 'Đã xóa người dùng!',
        textStyle: styles.toastText,
        visibilityTime: 5000,
      });
    } catch (error) {
      console.error('Lỗi khi xóa người dùng', error);
      Toast.show({
        text1: 'Lỗi',
        text2: 'Không thể xóa người dùng!',
        type: 'error',
        textStyle: styles.toastText,
        visibilityTime: 5000,
      });
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Tìm kiếm theo tên"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />
      {loading ? (
        <Text style={styles.loadingText}>Đang tải...</Text>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <Text style={styles.userText}>Tên: {item.name}</Text>
              <Text style={styles.userText}>Email: {item.email}</Text>
              <Text style={styles.userText}>Tuổi: {item.age}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEditUser(item)}>
                  <Text style={styles.buttonText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteUser(item.id)}>
                  <Text style={styles.buttonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      <UserForm onSubmit={editingUser ? updateUser : addUser} initialData={editingUser} />
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  userItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  userText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  searchInput: {
    borderColor: '#007BFF',
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#007BFF',
  },
  input: {
    borderColor: '#007BFF',
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
  },
  toastText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default App;
