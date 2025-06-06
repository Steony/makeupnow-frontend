import React from "react";
import { StyleSheet, Text, View } from "react-native";

const AdminHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur la page accueil Admin</Text>
    </View>
  );
};

export default AdminHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
});
