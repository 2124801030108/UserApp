import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const UserForm = ({ onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name.stringValue);
      setEmail(initialData.email.stringValue);
      setAge(String(initialData.age.integerValue));
    } else {
      setName('');
      setEmail('');
      setAge('');
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (name && email && age) {
      onSubmit({ name, email, age: parseInt(age) });
      setName('');
      setEmail('');
      setAge('');
    } else {
      alert("Vui lòng nhập tất cả thông tin!");
    }
  };

  return (
    <View style={styles.container}>
      <Text>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter name"
        value={name}
        onChangeText={setName}
      />
      <Text>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
      />
      <Text>Age</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
});

export default UserForm;
