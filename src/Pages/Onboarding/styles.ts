import { StyleSheet } from "react-native";
import Colors from "../../Constants/Colors";

export default StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.default2,
  },
  submitButton: {
    height: 45,
    width: '70%',
    alignItems: "center",
    justifyContent: "center",
    margin: 'auto',
    marginTop: 20,
    backgroundColor: Colors.default,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,
    elevation: 4,
  },

  textSubmit: {
    fontSize: 18,
    color: Colors.black,
  },
  slide: {
    flex: 1,
    top: 50,
    alignItems: 'center',
    width: '100%'
  },
  image: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    width: '80%'
  },
  description: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 30,
    width: '80%'
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 180,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
});