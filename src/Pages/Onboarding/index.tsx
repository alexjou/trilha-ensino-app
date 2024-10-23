import React, { useState, useRef, useEffect } from "react";
import { Text, SafeAreaView, View, TouchableOpacity, Dimensions, Image, PanResponder, Animated } from "react-native";
import styles from "./styles";
import { useNavigationHandler } from "../../Hooks/navigation";
import images from "../../Constants/images";
import Header from "../../Components/Header";

export default function Onboarding() {
  const navigate = useNavigationHandler();
  const { width: screenWidth } = Dimensions.get('window');
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.Value(0)).current;

  const data = [
    {
      title: 'Aqui o aluno é o protagonista',
      description: 'Conheça o #Trilha Ensino.',
      image: images.Onboarding1,
    },
    {
      title: 'Qual o seu perfil?',
      description: 'Estudante',
      image: images.Onboarding2,
    },
    {
      title: 'Vamos Começar!',
      description: 'Entre ou registre-se agora e comece a usar o app.',
      image: images.Onboarding3,
    },
    {
      title: 'Vamos Começar!',
      description: 'Entre ou registre-se agora e comece a usar o app.',
      image: images.Onboarding4,
    },
  ];

  const handleSwipe = (direction: string) => {
    console.log(direction, currentIndex)
    let newIndex = currentIndex;

    if (direction === "left" && currentIndex < data.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === "right" && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }
    console.log('novo index: ', newIndex)
    setCurrentIndex(newIndex);

    // Reseta a posição da animação para o próximo slide
    Animated.spring(position, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,
      onPanResponderMove: (_, gestureState) => {
        // Mover a imagem com o arraste
        position.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Verifica a distância de swipe para alterar o slide
        if (gestureState.dx > 50) {
          handleSwipe("right");
        } else if (gestureState.dx < -50) {
          handleSwipe("left");
        } else {
          // Se o swipe não for forte o suficiente, retorna à posição original
          Animated.spring(position, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const renderItem = (item: { title: string; description: string; image: any }) => (
    <Animated.View
      // {...panResponder.panHandlers}
      style={[
        styles.slide,
        { transform: [{ translateX: position }] }, // Move o slide com a animação
      ]}
    >
      <Image source={item.image} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      {/* Renderiza o slide atual */}
      {renderItem(data[currentIndex])}

      {/* Paginação */}
      <View style={styles.pagination}>
        {data.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              { opacity: index === currentIndex ? 1 : 0.3 },
            ]}
            onPress={() => setCurrentIndex(index)}
          />
        ))}
      </View>

      {/* Botão de ação */}
      <View style={{ width: '100%', position: 'absolute', bottom: 100 }}>
        {currentIndex >= data.length - 1 ? (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => navigate.navigate('Login')}
          >
            <Text style={styles.textSubmit}>Tudo certo</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => setCurrentIndex(currentIndex + 1)}
          >
            <Text style={styles.textSubmit}>Avançar</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
