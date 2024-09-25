import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';

// URL của Firebase Firestore
const BASE_URL = `https://firestore.googleapis.com/v1/projects/loc1-5e841/databases/(default)/documents/users`;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hàm để tải danh sách người dùng
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}:list`);
      if (response.data && response.data.documents) {
        const fetchedUsers = response.data.documents.map(doc => ({
          id: doc.name.split('/').pop(),
          ...doc.fields,
        }));
        setUsers(fetchedUsers);
      } else {
        console.warn('Không có dữ liệu người dùng');
        setUsers([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu người dùng', error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi hàm fetchUsers khi component được mount
  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách người dùng</Text>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text>{item.name.stringValue}</Text>
            <Text>{item.email.stringValue}</Text>
            <Text>{item.age.integerValue}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default UserList;
