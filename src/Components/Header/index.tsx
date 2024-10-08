import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import images from '../../Constants/images'; // Logo e outras imagens

const Header = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.headerContainer}>
      {/* Botão para voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      {/* Logo centralizada */}
      <Image source={images.Logo} style={styles.logo} />
    </View>
  );
};

export default Header;
