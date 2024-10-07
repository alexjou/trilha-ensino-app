
import { StyleSheet } from "react-native";
import Colors from "../../Constants/Colors";

export default StyleSheet.create({
  container: {
    paddingTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  input: {
    height: 30,
    width: '90%',
    fontSize: 18,
    // fontWeight: 'bold',
    color: Colors.text_selected,
  },
  buttonShow: {
    fontSize: 10,
    fontWeight: '700'
  }
});
