import { StyleSheet } from "react-native";
import Colors from "../../Constants/Colors";

export default StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    flex: 1,
    backgroundColor: '#e5ecf7',
    width: '100%',
    height: '100%',
  },


  containerFormLogin: {
    flex: 1 / 25,
    margin: 'auto',
    width: '80%',
    height: '55%',
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  h1: {
    fontSize: 32,
    color: Colors.default2,
    margin: 45,
  },
  submitButton: {
    height: 45,
    width: '70%',
    alignItems: "center",
    justifyContent: "center",
    margin: 'auto',
    marginTop: 20,
    backgroundColor: Colors.default2,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,
    elevation: 4,
  },
  input: {
    width: '85%',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.gray_tab,
    backgroundColor: '#e5ecf799',
    borderRadius: 8,
    height: 56,
    marginTop: 10
  },
  inputError: {
    width: '85%',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.red,
    backgroundColor: '#e5ecf799',
    borderRadius: 8,
    height: 56,
    marginTop: 10
  },

  submitText: {
    fontSize: 20,
    color: Colors.white,
  },
  validation: {
    flex: 1,
    paddingLeft: 20,
    marginBottom: -10,
    marginTop: -10,
    color: Colors.text_error,
  },
  seccondButton: {
    marginBottom: 30,
  },
  textFirst: {
    color: Colors.gray_tab,
    marginTop: 20,
  },
  textSeccond: {
    color: '#187249',
    textDecorationLine: 'underline',
  },
});
