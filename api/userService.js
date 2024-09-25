import axios from 'axios';

// URL của Firebase Firestore
const BASE_URL = `https://console.firebase.google.com/project/loc1-5e841/firestore/databases/-default-/data/~2Fuser~2FgjahFmVY3DxXEUFqOCC8`;

// Lấy danh sách người dùng
export const getUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}:list`);
    return response.data.documents.map(doc => ({
      id: doc.name.split('/').pop(),
      name: doc.fields.name.stringValue,
      email: doc.fields.email.stringValue,
      age: doc.fields.age.integerValue,
    }));
  } catch (error) {
    throw new Error('Lỗi khi tải dữ liệu người dùng: ' + error.message);
  }
};

// Thêm người dùng mới
export const addUser = async (userData) => {
  try {
    const response = await axios.post(BASE_URL, {
      fields: {
        name: { stringValue: userData.name },
        email: { stringValue: userData.email },
        age: { integerValue: userData.age },
      },
    });

    // Trả về thông tin người dùng vừa thêm
    return {
      id: response.data.name.split('/').pop(),
      ...userData,
    };
  } catch (error) {
    throw new Error('Lỗi khi thêm người dùng: ' + error.message);
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (id, updatedData) => {
  try {
    await axios.patch(`${BASE_URL}/${id}`, {
      fields: {
        name: { stringValue: updatedData.name },
        email: { stringValue: updatedData.email },
        age: { integerValue: updatedData.age },
      },
    });
  } catch (error) {
    throw new Error('Lỗi khi cập nhật người dùng: ' + error.message);
  }
};

// Xóa người dùng
export const deleteUser = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    throw new Error('Lỗi khi xóa người dùng: ' + error.message);
  }
};
