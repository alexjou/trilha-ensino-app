import { StyleSheet } from 'react-native';
import Colors from '../../Constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  microphoneButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: '80%',
  },
  microphoneButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default styles;