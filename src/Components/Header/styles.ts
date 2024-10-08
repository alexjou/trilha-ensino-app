import { StyleSheet } from 'react-native';
import Colors from '../../Constants/Colors';

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    height: 60,
    backgroundColor: Colors.default, // ou use 'images.default2' como background
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20, // Botão de voltar fica à esquerda
  },
  backText: {
    fontSize: 16,
    // color: '#128C7E', // Cor do texto de voltar
  },
  logo: {
    width: 120, // Tamanho da logo centralizada
    height: 40,
    resizeMode: 'contain',
  },
});

export default styles;
